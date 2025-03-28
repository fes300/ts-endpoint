import { defineProject, mergeConfig } from 'vitest/config';
import vitestBaseConfig from '../../vitest.config.mjs';

export default mergeConfig(
  vitestBaseConfig,
  defineProject({
    test: {
      name: 'ts-endpoint-express',
      typecheck: { enabled: true }
    },
  })
);
