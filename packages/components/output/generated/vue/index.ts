export * from './generated/components';
export * from '@lpcp/components/core';
export type * from '@lpcp/components';

import * as coreExports from '@lpcp/components/core';
import * as generatedComponents from './generated/components';

const vueComponents = {
	...generatedComponents,
	...coreExports,
};

export default vueComponents;
