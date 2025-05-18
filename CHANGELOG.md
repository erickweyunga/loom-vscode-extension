# Changelog

All notable changes to the "Loom Language" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-05-18

### Added
- Initial release of Loom language support
- Syntax highlighting for all Loom language constructs
- TextMate grammar definitions
- Code snippets for common Loom patterns:
  - Thread functions
  - Variable declarations
  - Control flow (knot/pattern)
  - Loops
  - Module imports/exports
  - Functional operators (pipe, compose)
- Language configuration for:
  - Comment toggling
  - Bracket matching and autoclosing
  - Indentation rules
  - Code folding
- Basic editor commands:
  - Run current Loom file
- Configuration settings:
  - Diagnostics toggle
  - Format on save option
  - Tab size customization

### Changed
- Improved display names and descriptions
- Updated VSCode engine requirements to ^1.74.0

## [0.0.1] - 2025-05-01

### Added
- Initial development setup
- Basic project structure
- Minimal language identification