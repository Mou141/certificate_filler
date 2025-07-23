// Interop wrapper for utility functions
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System;
using System.Threading.Tasks;

public class UtilsInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    public UtilsInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/utils.js").AsTask());
    }

    public async Task ClearInputFileAsync(InputFile? inputFile)
    {
        if (inputFile == null)
        {
            return;
        }

        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("clearInputFileElem", inputFile.Element);
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