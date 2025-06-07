# Contributing to Ollama Benchmark Tool

Thank you for your interest in contributing! This guide will help you get started with development and contributions.

## 🚀 Quick Development Setup

### Prerequisites
- **Node.js 22+** (required for ESM support and native fetch)
- **TypeScript 5+**
- **Ollama** installed locally for testing
- **Git** for version control

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd ollama-benchmark-node

# Install dependencies
npm install

# Build the project
npm run build

# Test the CLI (development)
npm run dev info

# Or after global install
olbench info
```

## 🛠️ Development Workflow

### Available Scripts
- `npm run dev` - Run CLI with TypeScript hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run typecheck` - Type checking without compilation
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

### File Structure
```
src/
├── modules/           # Core business logic modules
│   ├── system-detection.ts
│   ├── model-discovery.ts
│   ├── benchmark-runner.ts
│   ├── results-processor.ts
│   ├── config-manager.ts
│   └── report-generator.ts
├── components/        # React/Ink UI components (future)
├── simple-cli.ts      # Working CLI implementation
└── index.ts          # Library exports

docs/                 # Documentation
config/              # Default configuration files
```

### Development Guidelines

#### Code Style
- **TypeScript** - Use strict typing
- **ESM modules** - Use import/export syntax
- **Async/await** - Prefer over Promises
- **Error handling** - Always handle errors gracefully
- **Comments** - Document complex logic and interfaces

#### Example Code Standards
```typescript
// Good: Clear interface definition
interface BenchmarkMetrics {
  model: string;
  tokensPerSecond: number;
  firstTokenLatency: number;
}

// Good: Proper error handling
async function benchmarkModel(model: string): Promise<BenchmarkMetrics> {
  try {
    const result = await runBenchmark(model);
    return result;
  } catch (error) {
    throw new Error(`Benchmark failed for ${model}: ${error}`);
  }
}

// Good: Descriptive function names
function calculateTokensPerSecond(tokens: number, durationMs: number): number {
  return tokens / (durationMs / 1000);
}
```

## 🔧 Adding New Features

### Adding a New Command
1. **Add to CLI** - Update `src/simple-cli.ts`
2. **Create handler** - Add business logic to appropriate module
3. **Add documentation** - Update relevant docs
4. **Test thoroughly** - Ensure it works across platforms

Example:
```typescript
// In simple-cli.ts
program
  .command('new-feature')
  .description('Description of new feature')
  .option('-x, --example <value>', 'Example option')
  .action(async (options) => {
    // Implementation
  });
```

### Adding a New Module
1. **Create module file** - `src/modules/new-module.ts`
2. **Define interfaces** - Clear TypeScript interfaces
3. **Export from index** - Add to `src/index.ts`
4. **Add tests** - Create test files (future)
5. **Document API** - Update `docs/API.md`

### Adding New Output Formats
1. **Extend ReportGenerator** - Add new format method
2. **Update interfaces** - Add to `OutputFormat` type
3. **Test output** - Ensure proper formatting
4. **Document usage** - Add examples

Example:
```typescript
// In report-generator.ts
private generateXmlReport(report: BenchmarkReport): string {
  // XML generation logic
}

// Update OutputFormat type
type OutputFormat = 'json' | 'csv' | 'markdown' | 'html' | 'xml';
```

### Adding New Model Sources
1. **Extend ModelDiscovery** - Add new discovery methods
2. **Update PopularModel data** - Add new models to the list
3. **Test discovery** - Ensure accurate information
4. **Update categories** - If adding new categories

## 🧪 Testing Guidelines

### Manual Testing Checklist
Before submitting changes, test:

#### Basic Functionality
- [ ] `olbench info` shows system information
- [ ] `olbench discover` shows model recommendations
- [ ] `olbench run --models "small-model"` completes successfully
- [ ] All output formats generate properly
- [ ] Configuration loading works

#### Edge Cases
- [ ] No models installed
- [ ] Ollama not running
- [ ] Invalid model names
- [ ] Network connectivity issues
- [ ] Low memory conditions

#### Cross-Platform (if possible)
- [ ] macOS (Intel/ARM)
- [ ] Windows
- [ ] Linux

### Future: Automated Testing
We plan to add:
- Unit tests for core modules
- Integration tests for CLI commands
- Performance regression tests
- Cross-platform CI/CD

## 📝 Documentation Standards

### Code Documentation
- **JSDoc comments** for public methods
- **Inline comments** for complex logic
- **Interface documentation** with examples
- **README updates** for new features

### Documentation Files
When adding features, update:
- `docs/USER-GUIDE.md` - User-facing instructions
- `docs/API.md` - API reference
- `docs/EXAMPLES.md` - Practical examples
- `docs/TECHNICAL.md` - Technical details

### Documentation Style
- **Clear headings** with emoji for visual appeal
- **Code examples** with proper syntax highlighting
- **Step-by-step instructions** for complex procedures
- **Cross-references** between related sections

## 🐛 Bug Reports

### Before Reporting
1. **Check existing issues** - Avoid duplicates
2. **Test on latest version** - Ensure it's not already fixed
3. **Minimal reproduction** - Simplest case that shows the bug

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Run command: `olbench ...` (or `npm run dev ...` for development)
2. Expected behavior
3. Actual behavior

## Environment
- OS: macOS/Windows/Linux
- Node.js version: `node --version`
- Ollama version: `ollama --version`
- Tool version: (from package.json)

## Additional Context
- Error messages
- Screenshots if helpful
- Relevant configuration
```

## ✨ Feature Requests

### Feature Request Template
```markdown
## Feature Description
What you'd like to see added

## Use Case
Why this would be useful

## Proposed Implementation
Ideas on how it could work

## Alternatives Considered
Other approaches you've thought about
```

## 🔀 Pull Request Process

### Before Submitting
1. **Create an issue** - Discuss the change first
2. **Fork the repository** - Work in your own fork
3. **Create feature branch** - `git checkout -b feature/description`
4. **Make changes** - Follow coding standards
5. **Test thoroughly** - Manual testing checklist
6. **Update documentation** - Keep docs current
7. **Commit with clear messages** - Descriptive commit messages

### PR Template
```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] All commands work as expected
- [ ] Documentation updated
- [ ] No breaking changes (or clearly marked)

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Changes tested locally
```

### Review Process
1. **Automated checks** - TypeScript compilation, linting
2. **Manual review** - Code quality, functionality
3. **Testing** - Reviewer tests the changes
4. **Approval** - At least one maintainer approval
5. **Merge** - Squash and merge preferred

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

### Release Checklist
1. **Update version** - `package.json`
2. **Update CHANGELOG** - Document changes
3. **Build and test** - Final verification
4. **Tag release** - `git tag v1.x.x`
5. **Create release notes** - GitHub release
6. **Publish** - npm publish (when ready)

## 🤝 Community Guidelines

### Code of Conduct
- **Be respectful** - Constructive feedback only
- **Be inclusive** - Welcome all contributors
- **Be patient** - Help newcomers learn
- **Be collaborative** - Work together toward solutions

### Communication
- **GitHub Issues** - Bug reports, feature requests
- **Discussions** - General questions, ideas
- **Pull Requests** - Code changes, documentation
- **Clear communication** - Be specific and helpful

## 🔮 Future Plans

### Upcoming Features
- React/Ink UI (when compatibility resolves)
- Automated testing suite
- Performance regression detection
- Plugin system for extensions
- Cloud model comparison
- Real-time monitoring dashboard

### How to Help
- **Bug fixes** - Always welcome
- **Documentation** - Improve clarity and examples
- **Testing** - Cross-platform validation
- **Features** - Discuss in issues first
- **Performance** - Optimization opportunities
- **User experience** - CLI usability improvements

## 📞 Getting Help

### Resources
- **Documentation** - Start with [User Guide](USER-GUIDE.md)
- **Examples** - Check [Examples](EXAMPLES.md)
- **API Reference** - See [API documentation](API.md)
- **Technical Details** - Review [Technical Docs](TECHNICAL.md)

### Contact
- **GitHub Issues** - Public discussion preferred
- **Discussions** - For broader questions
- **Direct contact** - For security issues only

---

Thank you for contributing to the Ollama Benchmark Tool! Every contribution, no matter how small, helps make the tool better for everyone.