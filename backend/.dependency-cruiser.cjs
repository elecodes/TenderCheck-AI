module.exports = {
  forbidden: [
    {
      name: 'domain-isolation',
      comment: 'Domain Code MUST NOT depend on Infrastructure or Presentation',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: [
            '^src/infrastructure',
            '^src/presentation'
        ]
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
