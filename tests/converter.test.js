import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { convertYamlToXml } from '../bin/cli.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Core Converter Functionality', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schemaspy-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Basic conversion functionality', () => {
    test('should convert simple YAML schema to XML', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'simple-schema.yml');
      const outputFile = path.join(tempDir, 'output.xml');

      convertYamlToXml(inputFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlContent).toContain('<schemaMeta xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
      expect(xmlContent).toContain('xsi:noNamespaceSchemaLocation="http://schemaspy.org/xsd/6/schemameta.xsd"');
      expect(xmlContent).toContain('<comments>Simple test database</comments>');
      expect(xmlContent).toContain('<table name="test_table" comments="Test table">');
      expect(xmlContent).toContain('<column name="id" comments="Primary key"');
      expect(xmlContent).toContain('<primaryKey column="id"/>');
    });

    test('should output pretty formatted XML', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'simple-schema.yml');
      const outputFile = path.join(tempDir, 'pretty-output.xml');

      convertYamlToXml(inputFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('\n  <comments>');
      expect(xmlContent).toContain('\n    <table');
    });

    test('should create output directory if it does not exist', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'simple-schema.yml');
      const nestedDir = path.join(tempDir, 'nested', 'dir');
      const outputFile = path.join(nestedDir, 'output.xml');

      convertYamlToXml(inputFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should throw error when input file does not exist', () => {
      const nonExistentFile = path.join(tempDir, 'non-existent.yml');
      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(nonExistentFile, outputFile);
      }).toThrow('Input file does not exist');
    });

    test('should throw error when YAML is invalid', () => {
      const invalidFile = path.join(__dirname, '__fixtures__', 'invalid-schema.yml');
      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(invalidFile, outputFile);
      }).toThrow('Failed to parse YAML file');
    });

    test('should throw error when YAML file is empty', () => {
      const emptyFile = path.join(tempDir, 'empty.yml');
      fs.writeFileSync(emptyFile, '');

      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(emptyFile, outputFile);
      }).toThrow('YAML file is empty or invalid');
    });

    test('should throw error when output directory is not writable', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'simple-schema.yml');
      const readOnlyDir = path.join(tempDir, 'readonly');
      fs.mkdirSync(readOnlyDir);
      fs.chmodSync(readOnlyDir, 0o444);

      const outputFile = path.join(readOnlyDir, 'output.xml');

      expect(() => {
        convertYamlToXml(inputFile, outputFile);
      }).toThrow('Failed to write output file');

      fs.chmodSync(readOnlyDir, 0o755);
    });

    test('should throw error when input file has invalid extension', () => {
      const invalidExtFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(invalidExtFile, 'test content');

      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(invalidExtFile, outputFile);
      }).toThrow('Input file must have .yml or .yaml extension, got: .txt');
    });

    test('should accept .yaml extension', () => {
      const yamlFile = path.join(tempDir, 'test.yaml');
      fs.writeFileSync(yamlFile, 'tables: []');

      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(yamlFile, outputFile);
      }).not.toThrow();

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    test('should accept .yml extension', () => {
      const ymlFile = path.join(tempDir, 'test.yml');
      fs.writeFileSync(ymlFile, 'tables: []');

      const outputFile = path.join(tempDir, 'output.xml');

      expect(() => {
        convertYamlToXml(ymlFile, outputFile);
      }).not.toThrow();

      expect(fs.existsSync(outputFile)).toBe(true);
    });
  });

  describe('XML structure validation', () => {
    test('should generate correct XML structure for tables with columns', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'simple-schema.yml');
      const outputFile = path.join(tempDir, 'structure-test.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');

      expect(xmlContent).toContain('<tables>');
      expect(xmlContent).toContain('<table name="test_table" comments="Test table">');
      expect(xmlContent).toContain('<column name="id" comments="Primary key" type="INTEGER" size="11" nullable="false"/>');
      expect(xmlContent).toContain('<column name="name" comments="Name field" type="VARCHAR" size="100" nullable="false"/>');
    });

    test('should handle multiline comments in schema, tables, and columns', () => {
      const inputFile = path.join(__dirname, '__fixtures__', 'multiline-comments-schema.yml');
      const outputFile = path.join(tempDir, 'multiline-comments-test.xml');

      convertYamlToXml(inputFile, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');

      // Schema-level multiline comments - newlines converted to <br /> tags (XML-escaped)
      expect(xmlContent).toContain('<comments>これは複数行の&lt;br&gt;コメントのテストです&lt;br&gt;改行が含まれています&lt;br&gt;</comments>');

      // Table-level multiline comments - newlines converted to <br /> tags in attributes (XML-escaped)
      expect(xmlContent).toContain('<table name="users" comments="ユーザー情報を格納するテーブル&lt;br&gt;作成日: 2023-01-01&lt;br&gt;更新日: 2023-12-31&lt;br&gt;"');

      // Column-level multiline comments - newlines converted to <br /> tags in attributes (XML-escaped)
      expect(xmlContent).toContain('comments="ユーザーID&lt;br&gt;自動採番される主キー&lt;br&gt;"');
      expect(xmlContent).toContain('comments="メールアドレス&lt;br&gt;ユニーク制約あり&lt;br&gt;"');
      expect(xmlContent).toContain('comments="ユーザーの説明&lt;br&gt;複数行での説明が可能&lt;br&gt;HTMLタグは使用不可&lt;br&gt;"');
    });

    test('should handle schema without tables', () => {
      const minimalSchema = path.join(tempDir, 'minimal.yml');
      fs.writeFileSync(minimalSchema, 'comments: Minimal schema');

      const outputFile = path.join(tempDir, 'minimal-output.xml');

      convertYamlToXml(minimalSchema, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<schemaMeta xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
      expect(xmlContent).toContain('<comments>Minimal schema</comments>');
      expect(xmlContent).not.toContain('<tables>');
    });

    test('should handle schema without comments', () => {
      const noCommentsSchema = path.join(tempDir, 'no-comments.yml');
      fs.writeFileSync(noCommentsSchema, 'tables: []');

      const outputFile = path.join(tempDir, 'no-comments-output.xml');

      convertYamlToXml(noCommentsSchema, outputFile);

      const xmlContent = fs.readFileSync(outputFile, 'utf8');
      expect(xmlContent).toContain('<schemaMeta xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
      expect(xmlContent).not.toContain('<comments>');
    });
  });
});