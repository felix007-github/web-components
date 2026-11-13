import * as coreExports from '@mache-hangar/components/core';
import * as generatedComponents from './generated/components';

export * from './generated/components';
export * from '@mache-hangar/components/core';

const reactComponents = {
	...generatedComponents,
	...coreExports,
};

export default reactComponents;
