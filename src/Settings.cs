using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

using NAudio.Wave;
using NAudio.CoreAudioApi;

namespace NoiseScape;

class Settings {

  public class Device {

    [JsonPropertyName("index")]
    public int index = 0;
    [JsonPropertyName("name")]
    public string? name;

  }

  [JsonPropertyName("microphone")]
  public Device inputDevice = new Device();
  [JsonPropertyName("virtual")]
  public Device outputDevice = new Device();

  [JsonConstructor]
  public Settings() {}

  public Settings(OrderedDictionary<string, MMDevice> inputDevices, OrderedDictionary<string, MMDevice> outputDevices) {
    this.inputDevice.name = inputDevices.First().Key;
    this.outputDevice.name = outputDevices.First().Key;
  }

  public Settings(string inputDeviceName, int inputDeviceIndex, string outputDeviceName, int outputDeviceIndex) {
    this.inputDevice.name = inputDeviceName;
    this.inputDevice.index = inputDeviceIndex;
    this.outputDevice.name = outputDeviceName;
    this.outputDevice.index = outputDeviceIndex;
  }

}
