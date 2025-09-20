# schemaspy-yml-to-xml

![test](https://github.com/qazsato/schemaspy-yml-to-xml/actions/workflows/test.yml/badge.svg)
![NPM Version](https://img.shields.io/npm/v/schemaspy-yml-to-xml?color=61d800)
![NPM Downloads](https://img.shields.io/npm/dm/schemaspy-yml-to-xml?color=61d800)
![NPM License](https://img.shields.io/npm/l/schemaspy-yml-to-xml?color=61d800)

A CLI tool to convert YAML schema files to SchemaSpy XML format.

## Usage

```bash
npx schemaspy-yml-to-xml -i <input.yml> [-o <output.xml>]
```

### Options

- `-i, --input <file>` - Input YAML file path (required)
- `-o, --output <file>` - Output XML file path (default: `schemameta.xml`)
- `-h, --help` - Show help

## YAML Schema Format

This tool supports all SchemaSpy schemaMeta.xml features. Here are some
examples:

### Basic Schema

```yaml
comments: |
  Database schema documentation
  Multi-line comments supported

tables:
  - name: users
    comments: User table
    columns:
      - name: id
        type: INT
        primaryKey: true
        comments: Primary key
      - name: email
        type: VARCHAR
        size: 255
        nullable: false
        comments: User email address
    primaryKey: id
```

### Advanced Features

```yaml
tables:
  # Remote table
  - name: CONTRACTS
    remoteCatalog: other_db
    remoteSchema: other_schema
    comments: Remote table example
    columns:
      - name: contract_id
        type: INT
        primaryKey: true
        autoUpdated: true

  # Column-level foreign keys
  - name: ORDERS
    columns:
      - name: user_id
        type: INT
        comments: Reference to users table
        foreignKey:
          table: users
          column: id
          type: fk
          deleteRule: CASCADE
          updateRule: RESTRICT

  # Relationship controls
  - name: PRODUCTS
    columns:
      - name: category_id
        type: INT
        disableImpliedKeys: all
        disableDiagramAssociations: all
        comments: Category reference with disabled relationships

  # Indexes and table-level foreign keys
  - name: POSTS
    columns:
      - name: id
        type: INT
        primaryKey: true
      - name: user_id
        type: INT
      - name: title
        type: VARCHAR
        size: 255
    indexes:
      - name: idx_user_posts
        unique: false
        columns:
          - user_id
          - name: created_at
            ascending: false
    foreignKeys:
      - name: fk_posts_user
        column: user_id
        referencesTable: users
        referencesColumn: id
        deleteRule: CASCADE
```

## Output

The tool generates XML files that are fully compatible with SchemaSpy:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<schemaMeta xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:noNamespaceSchemaLocation="http://schemaspy.org/xsd/6/schemameta.xsd">
  <comments>Database schema documentation</comments>
  <tables>
    <table name="users" comments="User table">
      <column name="id" type="INT" primaryKey="true" comments="Primary key"/>
      <!-- ... -->
    </table>
  </tables>
</schemaMeta>
```

## License

This project is licensed under the terms of the [MIT license](./LICENSE).

## Reference

- [SchemaMeta - SchemaSpy](https://schemaspy.readthedocs.io/en/latest/configuration/schemaMeta.html)
