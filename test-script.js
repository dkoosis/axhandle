// test.js - Basic test script for Axe Handle
const path = require('path');
const fs = require('fs');
const { parseMCPSchema } = require('./ts-parser');
const TemplateEngine = require('./template-engine');
const MCPServerGenerator = require('./generator');

// Configuration
const schemaPath = process.argv[2] || './schema.ts';
const outputDir = './test-output';

// Ensure input schema exists
if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Schema file not found: ${schemaPath}`);
  process.exit(1);
}

// Test Schema Parsing
console.log(`Testing schema parser with ${schemaPath}...`);
try {
  const schema = parseMCPSchema(schemaPath);
  console.log('Schema parsed successfully!');
  console.log(`Protocol Version: ${schema.version}`);
  console.log(`Interfaces: ${schema.summary.interfaceCount}`);
  console.log(`Type Aliases: ${schema.summary.typeCount}`);
  console.log(`Constants: ${schema.summary.constantCount}`);
  
  // Test Template Engine
  console.log('\nTesting template engine...');
  
  // Create a simple test template
  const templateDir = path.join(__dirname, 'templates-test');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  
  const testTemplatePath = path.join(templateDir, 'test.ejs');
  const testTemplateContent = `// Generated by Axe Handle Test
const schema = {
  version: "<%= schema.version %>",
  interfaces: <%= Object.keys(schema.interfaces).length %>,
  types: <%= Object.keys(schema.types).length %>,
  constants: <%= Object.keys(schema.constants).length %>
};

<% if (schema.interfaces.InitializeRequest) { %>
// Has initialize request
<% } %>

<% Object.keys(schema.interfaces).slice(0, 3).forEach(function(interfaceName) { %>
// Interface: <%= interfaceName %>
<% }); %>
`;

  fs.writeFileSync(testTemplatePath, testTemplateContent);
  
  // Initialize template engine
  const templateEngine = new TemplateEngine(templateDir);
  templateEngine.loadTemplates();
  
  // Test rendering
  const rendered = templateEngine.render('test', { schema });
  console.log('Template rendered successfully!');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  const outputPath = path.join(outputDir, 'test-output.js');
  templateEngine.writeFile(outputPath, rendered);
  console.log(`Test output written to ${outputPath}`);
  
  // Test Generator
  console.log('\nTesting generator...');
  const generator = new MCPServerGenerator({
    schemaPath,
    outputDir: path.join(outputDir, 'server'),
    framework: 'express',
    config: {
      projectName: 'test-server',
      version: '0.1.0',
      description: 'Test MCP Server',
      author: 'Axe Handle Test',
      license: 'MIT'
    }
  });
  
  // Initialize generator
  generator.initialize();
  console.log('Generator initialized successfully!');
  
  // Parse schema and prepare context
  const generatorSchema = generator.parseSchema();
  const context = generator.prepareContext(generatorSchema);
  console.log('Context prepared successfully!');
  console.log(`Protocol Version: ${context.protocolVersion}`);
  console.log(`Request Categories: ${Object.keys(context.requestCategories).join(', ')}`);
  
  console.log('\nAll tests completed successfully!');
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
