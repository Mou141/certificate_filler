using Microsoft.JSInterop;
using System;
using System.Threading.Tasks;

public class PdfInterop : IAsyncDisposable
{
    private readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    public PdfInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/pdfInterop.js").AsTask());
    }

    public async Task<string> LoadPdfAsync(byte[] file)
    {
        var module = await _moduleTask.Value;

        return await module.InvokeAsync<string>("loadPdf", file);
    }

    public async Task DeletePdfAsync(string? pdfHandle)
    {
        if (pdfHandle == null) return;

        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("deletePdf", pdfHandle);
    }

    public async Task<string> GetPdfBlobUrlAsync(string? pdfHandle)
    {
        if (pdfHandle == null) return string.Empty;

        var module = await _moduleTask.Value;
        return await module.InvokeAsync<string>("getPdfBlobUrl", pdfHandle);
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