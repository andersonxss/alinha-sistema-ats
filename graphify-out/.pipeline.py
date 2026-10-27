import json, sys
from pathlib import Path

OUT = Path('graphify-out')
ROOT = Path('.').resolve()
SPEC = 'C:/Users/Anderson Souza/.codex/skills/graphify/references/extraction-spec.md'

def read(name):
    return json.loads((OUT / name).read_text(encoding='utf-8'))

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def merge():
    from graphify.cache import save_semantic_cache
    batches = read('.graphify_batches.json')
    chunks = []
    partial = []
    for i, files in enumerate(batches, 1):
        c = read(f'.graphify_candidate_{i:02}.json')
        assert isinstance(c.get('nodes'), list) and isinstance(c.get('edges'), list)
        assert isinstance(c.get('hyperedges', []), list)
        for f in files:
            actual = len(Path(f).read_text(encoding='utf-8', errors='replace').splitlines())
            reported = c.get('coverage', {}).get(f, 0)
            if reported < actual:
                partial.append(f)
                print(f'PARTIAL: {f}: {reported}/{actual}')
        chunks.append(c)
    for i, c in enumerate(chunks, 1):
        write(f'.graphify_chunk_{i:02}.json', c)
        read(f'.graphify_chunk_{i:02}.json')
    (OUT / '.graphify_partial.txt').write_text('\n'.join(partial), encoding='utf-8')
    new = {k: [v for c in chunks for v in c.get(k, [])] for k in ('nodes', 'edges', 'hyperedges')}
    new.update(input_tokens=0, output_tokens=0)
    write('.graphify_semantic_new.json', new)
    uncached = (OUT / '.graphify_uncached.txt').read_text(encoding='utf-8').splitlines()
    saved = save_semantic_cache(new['nodes'], new['edges'], new['hyperedges'], root=str(ROOT), allowed_source_files=uncached, prompt_file=SPEC, partial_source_files=partial)
    cached = read('.graphify_cached.json')
    sem = {k: cached.get(k, []) + new[k] for k in ('nodes', 'edges', 'hyperedges')}
    sem['nodes'] = list({n['id']: n for n in sem['nodes']}.values())
    sem.update(input_tokens=0, output_tokens=0)
    for n in sem['nodes'] + sem['edges']:
        n.setdefault('_origin', 'semantic')
    write('.graphify_semantic.json', sem)
    ast = read('.graphify_ast.json')
    seen = {n['id'] for n in ast['nodes']}
    merged = {'nodes': ast['nodes'] + [n for n in sem['nodes'] if n['id'] not in seen], 'edges': ast['edges'] + sem['edges'], 'hyperedges': sem['hyperedges'], 'input_tokens': 0, 'output_tokens': 0}
    write('.graphify_extract.json', merged)
    print(f"Merged {len(merged['nodes'])} nodes, {len(merged['edges'])} edges; cached {saved} semantic files; partial {len(partial)}")
    print('Host agent token usage unavailable; zeros are placeholders, not measured cost.')

def build(labeling=False):
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json
    from graphify.diagnostics import diagnose_extraction, format_diagnostic_report
    extraction = read('.graphify_extract.json')
    detection = read('.graphify_detect.json')
    g = build_from_json(extraction, root=str(ROOT), directed=False)
    assert g.number_of_nodes(), 'Empty extraction; existing outputs preserved'
    if labeling:
        a = read('.graphify_analysis.json')
        communities = {int(k): v for k, v in a['communities'].items()}
        cohesion = {int(k): v for k, v in a['cohesion'].items()}
        gods, surprises = a['gods'], a['surprises']
        labels = {int(k): v for k, v in read('.graphify_labels.json').items()}
    else:
        communities = cluster(g)
        cohesion = score_all(g, communities)
        gods, surprises = god_nodes(g), surprising_connections(g, communities)
        labels = {k: f'Community {k}' for k in communities}
    questions = suggest_questions(g, communities, labels)
    if not to_json(g, communities, str(OUT / 'graph.json'), community_labels=labels):
        raise RuntimeError('Shrink guard refused export; no force applied')
    report = generate(g, communities, cohesion, labels, gods, surprises, detection, {'input': 0, 'output': 0}, str(ROOT), suggested_questions=questions)
    report += '\n\nExtraction notes: Host-agent token usage was not exposed by the orchestration tool. Token zeros are placeholders, not a measured zero cost. 23 code files yielded no symbols in the AST extractor.\n'
    report += '\n`graphify-out/` was written into the working tree; unless ignored, it appears in `git status`. Add it to `.gitignore` or commit only the outputs the team should share.\n'
    (OUT / 'GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    write('.graphify_analysis.json', {'communities': communities, 'cohesion': cohesion, 'gods': gods, 'surprises': surprises, 'questions': questions})
    health = diagnose_extraction(extraction, directed=False, root=str(ROOT))
    write('graph-health.json', health)
    flags = {k: health.get(k, 0) for k in ('dangling_endpoint_edges', 'missing_endpoint_edges', 'self_loop_edges', 'directed_same_endpoint_collapsed_edges', 'undirected_same_endpoint_collapsed_edges') if health.get(k, 0)}
    if flags:
        with (OUT/'GRAPH_REPORT.md').open('a', encoding='utf-8') as f:
            f.write('\nGraph health warning: ' + json.dumps(flags) + '. Graph remains usable but can be incomplete; see graph-health.json.\n')
    print(format_diagnostic_report(health))
    print(f'Graph: {g.number_of_nodes()} nodes, {g.number_of_edges()} edges, {len(communities)} communities')
    if not labeling:
        for cid, members in communities.items():
            top = sorted(members, key=lambda n: g.degree(n), reverse=True)[:10]
            print(cid, len(members), [(g.nodes[n].get('label'), g.nodes[n].get('source_file')) for n in top])

def finish():
    from datetime import datetime, timezone
    from graphify.detect import save_manifest
    from graphify.cli import _stamped_manifest_files
    d, e = read('.graphify_detect.json'), read('.graphify_extract.json')
    corpus = d.get('all_files') or d['files']
    partial = set((OUT / '.graphify_partial.txt').read_text(encoding='utf-8').splitlines())
    mf = _stamped_manifest_files(corpus, e, ROOT, partial_source_files=partial)
    dispatched = {f for t, fs in d['files'].items() if t in ('document', 'paper', 'image') for f in fs}
    stamped = {f for fs in mf.values() for f in fs}
    save_manifest(mf, root=str(ROOT), scan_corpus={f for fs in corpus.values() for f in fs}, clear_semantic=dispatched-stamped or None)
    cost = read('cost.json') if (OUT/'cost.json').exists() else {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}
    cost['runs'].append({'date': datetime.now(timezone.utc).isoformat(), 'input_tokens': 0, 'output_tokens': 0, 'files': d['total_files'], 'usage_available': False, 'note': 'Host agent usage unavailable; zeros are placeholders.'})
    write('cost.json', cost)
    print('Manifest saved. Token cost unavailable (host tool did not expose usage).')
    for heading in ('God Nodes', 'Surprising Connections', 'Suggested Questions'):
        report = (OUT/'GRAPH_REPORT.md').read_text(encoding='utf-8')
        import re
        for section in re.split(r'(?=^## )', report, flags=re.M):
            if heading.lower() in section.split('\n', 1)[0].lower():
                print(section)
    names = ['.graphify_detect.json', '.graphify_extract.json', '.graphify_ast.json', '.graphify_semantic.json', '.graphify_analysis.json', '.graphify_partial.txt', '.graphify_cached.json', '.graphify_uncached.txt', '.graphify_semantic_new.json', '.graphify_batches.json', '.needs_update']
    names += [p.name for pattern in ('.graphify_chunk_*.json', '.graphify_candidate_*.json') for p in OUT.glob(pattern)]
    for name in names:
        (OUT/name).unlink(missing_ok=True)

if __name__ == '__main__':
    {'merge': merge, 'build': build, 'label': lambda: build(True), 'finish': finish}[sys.argv[1]]()
