import base from "../../frontend/vitest.config.mts";
export default {
  ...base,
  test: {
    ...base.test,
    include: ["../docs/auditoria-refatoracao-frontend/*.test.tsx"],
  },
};
