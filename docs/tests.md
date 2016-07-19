# Tests
## Integration testing
Protractor is used to make tests.
Complete the configuration file in tests/inputs/default.js with your SLURM cluster, your credentials and other parameters of configurations. They can be multiple inputs files, the file selected to make tests is indicated in tests/conf.js.

Run the web driver in a command prompt
```
webdriver-manager start
```
In other command prompt, go to tests folder and execute protractor
```
cd tests
protractor conf.js
```

TODO :
- more tests

## Unit testing
TODO :
- more tests
- documentation
