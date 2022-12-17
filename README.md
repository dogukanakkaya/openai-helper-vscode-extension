# OpenAI Helper

This extension helps you to use OpenAI products in Visual Studio Code

**:warning: For now only Codex usage is recommended since the ChatGPT API that this project uses is unofficial, you might face 403 or 429 HTTP errors with ChatGPT strategy and maybe future breaks if OpenAI change things. Also some features/fixes of newer versions of the API module requires Node.js >=18 but latest VSCode version runs Electron with Node 16 and it cannot be changed. A workaround may written but I see that unnecessary since there is no official API (https://github.com/transitive-bullshit/chatgpt-api/issues/137). Maybe I'll reimplement ChatGPT strategy this later when official API is out (or be lazy enough not to)**

<br>

![code_generation](https://user-images.githubusercontent.com/51231605/208255187-1eebaadb-c7d2-4113-883f-5a273d01bec0.gif)

## Usage

- You can access commands via pressing CMD + Shift + P (CTRL + Shift + P for Windows)
- If you set OpenAI Api Key then you'll be using Codex
- If you set ChatGPT Credentials then you'll be using ChatGPT
- To change between, just empty the credentials of other one by setting them empty.

### Set OpenAI Api Key
You can get your api key from here: https://beta.openai.com/account/api-keys

<br>

### Set ChatGPT Credentials
You can get your credentials from `Developer Tools -> Application Tab -> Cookies` and then get session token and clearance token from there.
Reason why: see warning above for more info.

<br>

### Generate @ai
- Search for `OpenAI Helper: Generate` command, press enter
- After that you'll see wait text for all of your comment lines starts with `@ai ...`
- You'll get the response generated after a while (depending on the response time of ChatGPT/Codex APIs)

<br>

### Refactor Selection
- Select the function or code piece you want to refactor, search for `OpenAI Helper: Refactor Selection` command, press enter
- After that you'll see wait text for your selection
- You'll get the response generated after a while (depending on the response time of ChatGPT/Codex APIs)

<br>

### Image Generation
- Search for `OpenAI Helper: Image Generation` command, press enter
- After that you'll need to answer several questions about the image
- The generated image will be saved to your working directory

![image-generation](https://user-images.githubusercontent.com/51231605/208255255-b57e3fb7-ffaa-4a4f-979a-d16f2b176c18.gif)

<br>

### Create Test
@todo

<br>

### Analyze Code
@todo

<br>

## Todo

- [x] Add refactor selection command
- [x] OpenAI Codex option
- [x] Add image generation command
- [ ] Allow to set temperature for Codex
- [ ] Stream the response for ChatGPT instead of waiting for it to be finished
- [ ] Generate wait texts as placeholders instead of inserting comment lines to file
- [ ] Analyze selected code and explain (why it's broken etc.)
- [ ] Add create test for function command
- [ ] Run multiple `@ai` comments in parallel
- [ ] Ability to create conversation and change the generated responses
- [ ] After ChatGPT has an official API or unofficial one's problems are fixed separate Codex and ChatGPT completely with different commands
- [ ] Write test
