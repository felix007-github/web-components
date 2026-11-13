import * as coreExports from '@lpcp/components/core';
import * as generatedComponents from './generated/components';

export * from './generated/components';
export * from '@lpcp/components/core';

const reactComponents = {
	...generatedComponents,
	...coreExports,
};

export default reactComponents;
