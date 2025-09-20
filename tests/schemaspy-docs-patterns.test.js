import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { convertYamlToXml } from '../bin/cli.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SchemaSpy Official Documentation Compliance', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schemaspy-docs-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Multi-line comments', () => {
    test('should handle multi-line database comments', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'multiline-comments.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('Complete SchemaSpy documentation patterns test');
      expect(xmlContent).toContain('Multi-line database comment');
    });

    test('should handle multi-line table comments', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'table-comments.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('Account table with multi-line comments');
      expect(xmlContent).toContain('Used for managing user accounts');
    });
  });

  describe('Remote table features', () => {
    test('should handle remoteCatalog and remoteSchema attributes', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'remote-tables.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<table name="CONTRACT"');
      expect(xmlContent).toContain('remoteCatalog="other"');
      expect(xmlContent).toContain('remoteSchema="other"');
      expect(xmlContent).toContain('comments="Remote table from another catalog/schema"');
    });
  });

  describe('Column-level foreign keys', () => {
    test('should handle simple column foreign keys', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'column-fks.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<table name="AGENT"');
      expect(xmlContent).toContain('<column name="acId"');
      expect(xmlContent).toContain('<foreignKey table="ACCOUNT" column="accountId"/>');
    });

    test('should handle foreign keys with rules and type', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'fk-rules.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<column name="contractId"');
      expect(xmlContent).toContain('type="fk"');
      expect(xmlContent).toContain('deleteRule="CASCADE"');
      expect(xmlContent).toContain('updateRule="RESTRICT"');
    });
  });

  describe('Column attributes', () => {
    test('should handle primaryKey attribute on columns', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'primary-keys.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('name="accountId"');
      expect(xmlContent).toContain('primaryKey="true"');
      expect(xmlContent).toContain('name="contractId"');
      expect(xmlContent).toContain('autoUpdated="true"');
    });

    test('should handle nullable and defaultValue attributes', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'column-attributes.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('nullable="false"');
      expect(xmlContent).toContain('defaultValue="ACTIVE"');
      expect(xmlContent).toContain('defaultValue="CURRENT_TIMESTAMP"');
      expect(xmlContent).toContain('size="100"');
      expect(xmlContent).toContain('size="255"');
    });

    test('should handle autoUpdated attribute', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'auto-updated.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('autoUpdated="true"');
      expect(xmlContent).toContain('name="createdAt"');
    });
  });

  describe('Relationship control attributes', () => {
    test('should handle disableImpliedKeys="all"', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'disable-implied-keys.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<table name="ORDERS"');
      expect(xmlContent).toContain('disableImpliedKeys="all"');
      expect(xmlContent).toContain('<column name="accountId"');
    });

    test('should handle disableDiagramAssociations variations', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'disable-associations.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('disableDiagramAssociations="all"');
      expect(xmlContent).toContain('disableDiagramAssociations="exceptDirect"');
      expect(xmlContent).toContain('<column name="countryId"');
      expect(xmlContent).toContain('<column name="regionId"');
    });
  });

  describe('Indexes', () => {
    test('should handle simple indexes', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'indexes.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<index name="idx_user_posts" unique="false">');
      expect(xmlContent).toContain('<column name="userId" ascending="true"/>');
      expect(xmlContent).toContain('<column name="createdAt" ascending="true"/>');
    });

    test('should handle indexes with ascending/descending columns', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'index-ordering.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<index name="idx_published_created"');
      expect(xmlContent).toContain('<column name="published" ascending="true"/>');
      expect(xmlContent).toContain('<column name="createdAt" ascending="false"/>');
    });
  });

  describe('Table-level foreign keys', () => {
    test('should handle table-level foreign key definitions', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'table-fks.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<foreignKey name="fk_posts_user"');
      expect(xmlContent).toContain('type="fk"');
      expect(xmlContent).toContain('deleteRule="CASCADE"');
      expect(xmlContent).toContain('updateRule="RESTRICT"');
      expect(xmlContent).toContain('<column name="userId"/>');
      expect(xmlContent).toContain('<references table="ACCOUNT" column="accountId"/>');
    });
  });

  describe('Complex column variations', () => {
    test('should handle all column attribute combinations', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'complex-columns.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');

      // Test BIGINT with explicit attributes
      expect(xmlContent).toContain('<table name="COMPLEX_COLUMNS"');
      expect(xmlContent).toContain('type="BIGINT"');
      expect(xmlContent).toContain('autoUpdated="false"');

      // Test nullable variations
      expect(xmlContent).toContain('nullable="true"');
      expect(xmlContent).toContain('nullable="false"');

      // Test different default values
      expect(xmlContent).toContain('defaultValue="0"');
      expect(xmlContent).toContain('defaultValue="true"');

      // Test foreign key with all attributes
      expect(xmlContent).toContain('deleteRule="SET_NULL"');
      expect(xmlContent).toContain('updateRule="NO_ACTION"');

      // Test JSON type
      expect(xmlContent).toContain('type="JSON"');
    });
  });

  describe('Edge cases and empty collections', () => {
    test('should handle tables with empty indexes and foreignKeys arrays', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'empty-collections.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<table name="MINIMAL_TABLE"');
      expect(xmlContent).toContain('comments="Minimal table for testing edge cases"');
      // Should not contain empty index or foreignKey elements
      expect(xmlContent).not.toContain('<index></index>');
      expect(xmlContent).not.toContain('<foreignKey></foreignKey>');
    });
  });

  describe('XML schema validation', () => {
    test('should include proper namespace and schema location', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'schemaspy-docs-patterns.yml');
      const outputFile = path.join(tempDir, 'schema-validation.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlContent).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
      expect(xmlContent).toContain('xsi:noNamespaceSchemaLocation="http://schemaspy.org/xsd/6/schemameta.xsd"');
    });
  });
});