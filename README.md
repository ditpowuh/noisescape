# noisescape

Noisescape is a simplistic microphone-injecting soundboard app designed for Windows.
Inspired by Discord's soundboard, this app offers a web-based user interface.

Noisescape aims to avoid modifying your audio setup - Configuration can vary, but generally how it works is that your selected microphone input, and any soundboard sounds, is routed through to a virtual cable, to which it plays back as an audio input.

The virtual audio device I personally use and recommend is [VB-CABLE](https://vb-audio.com/Cable/).

### How to use
#### Using Source Code
1. Ensure you have Node.JS and .NET installed, as well as a virtual cable (such as [VB-CABLE](https://vb-audio.com/Cable/)).
2. Install client dependencies via `npm install`.
3. Run the application by `dotnet run` (.NET dependencies will be restored automatically - if not, use `dotnet restore`). 

#### Using Releases
1. Ensure you have a virtual cable installed (such as [VB-CABLE](https://vb-audio.com/Cable/)).
2. Download the application from `Releases`.
3. Extract the contents (if applicable - e.g. the portable version)
4. Run the executable file

### Build
In `client`:
```
npm run build
```

In `src`:
```
dotnet publish Noisescape.csproj -c Release --self-contained -r win-x64 -o ..\publish
```

**To see the full build process, check out the GitHub workflow in this repository.**
