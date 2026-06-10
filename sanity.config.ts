import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schema } from './src/sanity/schemas'
import { structure } from './src/sanity/structure'
import { projectId, dataset, apiVersion } from './src/sanity/env'

export default defineConfig({
	name: 'default',
	title: 'Playground',

	projectId,
	dataset,
	apiVersion,

	plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],

	schema,
})
