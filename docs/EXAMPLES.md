# Ollama Benchmark Tool - Examples

Practical examples and use cases for the Ollama Benchmark Tool.

## 🚀 Quick Start Examples

### Basic System Check
```bash
# Check what your system can handle
olbench info

# Get detailed information
olbench info --verbose
```

Example Output:
```
🖥️  System Information

Basic Information:
• Operating System: darwin (arm64)
• Total RAM: 24GB
• Available RAM: 14GB
• RAM Tier: Tier 3 (Tier 3 (16GB-31GB))

Ollama Status:
• Status: ✅ Running
• Version: v0.9.0

Recommended Models:
• gemma2:9b - Google Gemma 2 9B - Balanced performance
• mistral:7b - Mistral 7B - High-performance medium model
• phi4:14b - Microsoft Phi-4 14B - Advanced reasoning
```

### Finding Models to Test
```bash
# See what's available for your system
olbench discover

# Find coding models
olbench discover --category code

# Search for specific models
olbench discover --search llama

# See what's trending
olbench discover --trending
```

## 📊 Benchmarking Examples

### Quick Performance Test
```bash
# Test one model with minimal iterations
olbench run --models "gemma:2b" --iterations 2

# Test with specific prompts
olbench run --models "deepseek-coder:6.7b" --prompts coding --iterations 3
```

### Comprehensive Benchmark
```bash
# Test all recommended models for your tier
olbench run --tier 3 --iterations 5

# Custom benchmark with specific models
olbench run --models "llama3.1:8b,mistral:7b,gemma2:9b" --iterations 10 --output comprehensive-test.html --format html
```

### Model Comparison
```bash
# Compare chat vs code models
olbench run --models "llama3.1:8b" --prompts default --output chat-performance.json
olbench run --models "deepseek-coder:6.7b" --prompts coding --output code-performance.json

# Compare different prompt types on same model
olbench run --models "deepseek-r1:8b" --prompts reasoning --output reasoning-test.json
olbench run --models "deepseek-r1:8b" --prompts default --output general-test.json
```

## 🔧 Configuration Examples

### Custom Configuration File
```yaml
# my-benchmark.yml
version: "1.0.0"

benchmark:
  timeout: 600          # Longer timeout for large models
  iterations: 10        # More iterations for accuracy
  concurrency: 2        # Test concurrent performance
  warmupIterations: 3   # Extra warmup

prompts:
  custom_coding:
    - "Write a Python web scraper using requests and BeautifulSoup"
    - "Create a React component for a todo list with TypeScript"
    - "Implement a binary search tree in Java with unit tests"
    - "Write a SQL query to find the top 10 customers by revenue"
  
  custom_reasoning:
    - "A farmer has 17 sheep, all but 9 die. How many are left?"
    - "If you're in a race and pass the person in 2nd place, what place are you in?"
    - "Solve: 2x + 5 = 17, what is x?"

output:
  formats: ["json", "html", "csv"]
  directory: "./custom-results"
  includeSystemInfo: true
  saveRawResponses: true
```

Using custom config:
```bash
olbench run --config my-benchmark.yml --prompts custom_coding
```

### Environment-Specific Configs
```bash
# Development config (fast, few iterations)
olbench config --generate dev-config.yml
# Edit to set iterations: 2, timeout: 60

# Production config (comprehensive)
olbench config --generate prod-config.yml  
# Edit to set iterations: 20, timeout: 600
```

## 📈 Analysis Examples

### Performance Tracking Over Time
```bash
# Week 1 baseline
olbench run --output week1-baseline.json --iterations 10

# Week 2 comparison  
olbench run --output week2-results.json --iterations 10

# Compare results (future feature)
olbench compare --baseline week1-baseline.json --current week2-results.json
```

### Model Selection Workflow
```bash
# 1. Discover options
olbench discover --category chat

# 2. Install promising models
ollama pull llama3.1:8b
ollama pull mistral:7b  
ollama pull gemma2:9b

# 3. Quick comparison
olbench run --models "llama3.1:8b,mistral:7b,gemma2:9b" --iterations 3

# 4. Detailed test of winner
olbench run --models "mistral:7b" --iterations 10 --output final-choice.html --format html
```

## 🎯 Use Case Examples

### Code Generation Evaluation
```bash
# Test code models with coding prompts
olbench discover --category code
ollama pull deepseek-coder:6.7b
ollama pull codellama:7b

olbench run --models "deepseek-coder:6.7b,codellama:7b" --prompts coding --iterations 5 --output code-comparison.html
```

### Reasoning Model Assessment
```bash
# Test reasoning capabilities
olbench discover --category reasoning
ollama pull deepseek-r1:8b
ollama pull qwq:32b  # if you have enough RAM

olbench run --models "deepseek-r1:8b" --prompts reasoning --iterations 8 --output reasoning-test.json
```

### Vision Model Testing
```bash
# Test multimodal models
olbench discover --category vision
ollama pull llava:7b

olbench run --models "llava:7b" --prompts default --iterations 5
```

### Hardware Optimization
```bash
# Test performance with different concurrency
olbench run --models "mistral:7b" --concurrency 1 --output single-thread.json
olbench run --models "mistral:7b" --concurrency 2 --output dual-thread.json
olbench run --models "mistral:7b" --concurrency 4 --output quad-thread.json
```

## 🔄 Automation Examples

### Daily Performance Check
Create a script `daily-check.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
MODELS="gemma:2b,mistral:7b"

echo "Running daily performance check for $DATE"

olbench run \
  --models "$MODELS" \
  --iterations 3 \
  --output "daily-checks/performance-$DATE.json" \
  --format json

echo "Performance check complete. Results saved to daily-checks/performance-$DATE.json"
```

### Model Installation Helper
Create `install-recommended.sh`:
```bash
#!/bin/bash
echo "🔍 Discovering recommended models..."
olbench discover > recommended.txt

echo "📥 Installing recommended models..."
ollama pull llama3.1:8b
ollama pull mistral:7b  
ollama pull gemma2:9b

echo "🧪 Running benchmark on new models..."
olbench run --models "llama3.1:8b,mistral:7b,gemma2:9b" --output new-models-benchmark.html
```

### Performance Monitoring
Create `monitor.js`:
```javascript
const { exec } = require('child_process');
const fs = require('fs');

async function checkPerformance() {
  return new Promise((resolve, reject) => {
    exec('olbench run --models "mistral:7b" --iterations 1 --format json', 
      (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
  });
}

async function monitor() {
  try {
    const result = await checkPerformance();
    const data = JSON.parse(result);
    const performance = data.results[0].tokensPerSecond;
    
    console.log(`${new Date().toISOString()}: ${performance.toFixed(1)} tok/s`);
    
    // Log to file
    fs.appendFileSync('performance.log', 
      `${new Date().toISOString()},${performance}\n`);
    
    // Alert if performance drops
    if (performance < 20) {
      console.warn('⚠️ Performance degradation detected!');
    }
  } catch (error) {
    console.error('Monitoring failed:', error);
  }
}

// Run every 5 minutes
setInterval(monitor, 5 * 60 * 1000);
console.log('Performance monitoring started...');
```

## 📊 Report Examples

### HTML Report Features
When using `--format html`, reports include:
- Interactive performance charts
- System information cards  
- Model comparison tables
- Responsive design for mobile viewing
- Export capabilities

Example command:
```bash
olbench run --models "llama3.1:8b,mistral:7b" --iterations 5 --output detailed-report.html --format html
```

### CSV for Spreadsheet Analysis
```bash
olbench run --models "gemma:2b,mistral:7b,llama3.1:8b" --output spreadsheet-data.csv --format csv
```

Then import into Excel/Google Sheets for:
- Performance trend analysis
- Cost/performance calculations
- Custom visualizations

### Markdown for Documentation
```bash
olbench run --models "deepseek-coder:6.7b" --prompts coding --output code-model-evaluation.md --format markdown
```

Perfect for:
- Team documentation
- GitHub README files
- Technical reports

## 🚨 Troubleshooting Examples

### Debugging Low Performance
```bash
# Check system resources
olbench info --verbose

# Test with minimal load
olbench run --models "gemma:2b" --iterations 1 --concurrency 1

# Compare with known good model
olbench run --models "phi:2.7b" --iterations 2
```

### Model Installation Issues
```bash
# Check what's installed
olbench discover --installed

# Verify Ollama is working
ollama list

# Test with a small model first
ollama pull phi:2.7b
olbench run --models "phi:2.7b" --iterations 1
```

### Memory Issues
```bash
# Check available RAM
olbench info

# Use smaller models
olbench discover --search 2b

# Reduce concurrent operations
olbench run --concurrency 1
```

## 🎨 Custom Prompt Examples

### Creative Writing Prompts
```yaml
prompts:
  creative:
    - "Write a haiku about artificial intelligence discovering poetry"
    - "Create a short story where a debugging tool gains consciousness" 
    - "Compose a dialogue between two AI models comparing their architectures"
    - "Write a product description for a time machine designed by engineers"
```

### Technical Interview Prompts
```yaml
prompts:
  interview:
    - "Explain the difference between stack and heap memory allocation"
    - "Implement a function to reverse a linked list"
    - "Describe how you would design a URL shortener service"
    - "What are the trade-offs between SQL and NoSQL databases?"
```

### Math & Logic Prompts
```yaml
prompts:
  math:
    - "Solve: If f(x) = 2x + 3 and g(x) = x², what is f(g(4))?"
    - "A train travels 120km in 2 hours, then 180km in 3 hours. What's the average speed?"
    - "Prove that the sum of angles in a triangle equals 180 degrees"
    - "If you flip a fair coin 10 times, what's the probability of getting exactly 7 heads?"
```

## 🔮 Advanced Examples

### Multi-Language Code Generation
```bash
# Test the same coding task across different models
olbench run --models "deepseek-coder:6.7b" --prompts coding --output python-focus.json

# Create prompts for different languages
# prompts-languages.yml:
# multilang:
#   - "Write a binary search function in Python"
#   - "Write a binary search function in JavaScript" 
#   - "Write a binary search function in Java"
#   - "Write a binary search function in Rust"
```

### Performance Regression Testing
```bash
# Baseline before updates
olbench run --tier 3 --output baseline-v1.json

# After system/model updates  
olbench run --tier 3 --output current-v2.json

# Compare (future feature)
olbench compare --baseline baseline-v1.json --current current-v2.json
```

### Load Testing Simulation
```bash
# Simulate multiple users
olbench run --models "mistral:7b" --concurrency 5 --iterations 10

# Test sustained load
olbench run --models "llama3.1:8b" --iterations 20 --timeout 600
```

---

These examples should help you get started with the Ollama Benchmark Tool and explore its capabilities for your specific use cases!