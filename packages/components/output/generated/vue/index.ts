export * from './generated/components';
export * from '@mache-hangar/components/core';
export type * from '@mache-hangar/components';

import * as coreExports from '@mache-hangar/components/core';
import * as generatedComponents from './generated/components';

const vueComponents = {
	...generatedComponents,
	...coreExports,
};

export default vueComponents;
