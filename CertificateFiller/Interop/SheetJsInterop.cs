// Interop wrapper for SheetJS library
using Microsoft.JSInterop;
using System.Text.Json;

public class SheetJsInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    public SheetJsInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./js/sheetjsInterop.js").AsTask());
    }

    public async Task<JsonElement[]> ParseFileAsync(byte[] file)
    {
        var module = await _moduleTask.Value;

        return await module.InvokeAsync<JsonElement[]>(
            "parseFile", (object) file);
    }

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var module = await _moduleTask.Value;
            await module.DisposeAsync();
        }
    }
}