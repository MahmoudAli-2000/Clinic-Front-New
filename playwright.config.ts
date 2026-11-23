import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:30000,use:{baseURL:'http://127.0.0.1:4300',launchOptions:{executablePath:process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'],args:['--no-sandbox']}},webServer:{command:'node tests/serve.mjs',port:4300,reuseExistingServer:false},reporter:[['list'],['html',{open:'never'}]]});
