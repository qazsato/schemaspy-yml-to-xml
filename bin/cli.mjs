#!/usr/bin/env node
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { create } from 'xmlbuilder2';

program
  .name('schemaspy-yml-to-xml')
  .description('Convert YAML schema files to SchemaSpy XML format')
  .requiredOption('-i, --input <file>', 'Input YAML file path')
  .option('-o, --output <file>', 'Output XML file path', 'schemameta.xml')
  .action((options) => {
    try {
      convertYamlToXml(options.input, options.output);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

function convertYamlToXml(inputFile, outputFile) {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file does not exist: ${inputFile}`);
  }

  // Check file extension
  const ext = path.extname(inputFile).toLowerCase();
  if (ext !== '.yml' && ext !== '.yaml') {
    throw new Error(`Input file must have .yml or .yaml extension, got: ${ext}`);
  }

  let yamlContent;
  try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    yamlContent = YAML.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to parse YAML file: ${error.message}`);
  }

  if (!yamlContent) {
    throw new Error('YAML file is empty or invalid');
  }

  const xmlDoc = buildSchemaspyXml(yamlContent);

  const xmlOptions = {
    format: 'xml',
    prettyPrint: true,
    indent: '  '
  };

  const xmlString = xmlDoc.toString(xmlOptions);

  try {
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, xmlString, 'utf8');
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    throw new Error(`Failed to write output file: ${error.message}`);
  }
}

function buildSchemaspyXml(data) {
  const schemaMeta = {
    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@xsi:noNamespaceSchemaLocation': 'http://schemaspy.org/xsd/6/schemameta.xsd'
  };

  if (data.comments) {
    schemaMeta.comments = data.comments;
  }

  if (data.tables) {
    // Array format: tables: [{ name: "users" }, ...]
    schemaMeta.tables = {
      table: data.tables.map(table => buildTableXml(table))
    };
  }

  return create({ encoding: 'UTF-8', version: '1.0' }, { schemaMeta });
}

function buildTableXml(table) {
  const tableXml = {
    '@name': table.name
  };

  if (table.comments) {
    tableXml['@comments'] = table.comments;
  }

  // Remote table attributes
  if (table.remoteCatalog) {
    tableXml['@remoteCatalog'] = table.remoteCatalog;
  }

  if (table.remoteSchema) {
    tableXml['@remoteSchema'] = table.remoteSchema;
  }

  if (table.columns && Array.isArray(table.columns)) {
    tableXml.column = table.columns.map(column => buildColumnXml(column));
  }

  if (table.primaryKey) {
    tableXml.primaryKey = {
      '@column': table.primaryKey
    };
  }

  if (table.indexes && Array.isArray(table.indexes)) {
    tableXml.index = table.indexes.map(index => buildIndexXml(index));
  }

  if (table.foreignKeys && Array.isArray(table.foreignKeys)) {
    tableXml.foreignKey = table.foreignKeys.map(fk => buildForeignKeyXml(fk));
  }

  return tableXml;
}

function buildColumnXml(column) {
  const columnXml = {
    '@name': column.name
  };

  if (column.comments) {
    columnXml['@comments'] = column.comments;
  }

  if (column.type) {
    columnXml['@type'] = column.type;
  }

  if (column.size !== undefined) {
    columnXml['@size'] = column.size;
  }

  if (column.nullable !== undefined) {
    columnXml['@nullable'] = column.nullable;
  }

  if (column.autoUpdated !== undefined) {
    columnXml['@autoUpdated'] = column.autoUpdated;
  }

  if (column.defaultValue !== undefined) {
    columnXml['@defaultValue'] = column.defaultValue;
  }

  // Primary key attribute
  if (column.primaryKey !== undefined) {
    columnXml['@primaryKey'] = column.primaryKey;
  }

  // Relationship control attributes
  if (column.disableImpliedKeys) {
    columnXml['@disableImpliedKeys'] = column.disableImpliedKeys;
  }

  if (column.disableDiagramAssociations) {
    columnXml['@disableDiagramAssociations'] = column.disableDiagramAssociations;
  }

  // Column-level foreign key
  if (column.foreignKey) {
    columnXml.foreignKey = buildColumnForeignKeyXml(column.foreignKey);
  }

  return columnXml;
}

function buildIndexXml(index) {
  return {
    '@name': index.name,
    '@unique': index.unique || false,
    column: index.columns?.map(col => ({
      '@name': typeof col === 'string' ? col : col.name,
      '@ascending': typeof col === 'object' ? (col.ascending !== false) : true
    })) || []
  };
}

function buildForeignKeyXml(foreignKey) {
  return {
    '@name': foreignKey.name,
    '@type': foreignKey.type || 'fk',
    '@deleteRule': foreignKey.deleteRule || 'no action',
    '@updateRule': foreignKey.updateRule || 'no action',
    column: {
      '@name': foreignKey.column
    },
    references: {
      '@table': foreignKey.referencesTable,
      '@column': foreignKey.referencesColumn
    }
  };
}

function buildColumnForeignKeyXml(foreignKey) {
  const fkXml = {
    '@table': foreignKey.table,
    '@column': foreignKey.column
  };

  if (foreignKey.type) {
    fkXml['@type'] = foreignKey.type;
  }

  if (foreignKey.deleteRule) {
    fkXml['@deleteRule'] = foreignKey.deleteRule;
  }

  if (foreignKey.updateRule) {
    fkXml['@updateRule'] = foreignKey.updateRule;
  }

  return fkXml;
}

export { convertYamlToXml };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  program.parse();
}