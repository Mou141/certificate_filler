using Microsoft.JSInterop;
using System.Text.Json;

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

    public async Task<byte[]> GetPdfBytesAsync(string? pdfHandle)
    {
        if (pdfHandle == null) return Array.Empty<byte>();

        var module = await _moduleTask.Value;
        int[] byteArray = await module.InvokeAsync<int[]>("getPdfBytes", pdfHandle);

        return byteArray.Select(b => (byte)b).ToArray();
    }

    public async Task<string> FillAndFlattenPdfAsync(string? pdfHandle, JsonElement formData, bool strict = true)
    {
        if (string.IsNullOrEmpty(pdfHandle))
        {
            throw new ArgumentException("PDF handle cannot be null or empty.", nameof(pdfHandle));
        }

        var module = await _moduleTask.Value;
        Dictionary<string, string> formDataDict = formData.EnumerateObject().ToDictionary(prop => prop.Name, prop => prop.Value.GetString() ?? "");

        string newPdfHandle = await module.InvokeAsync<string>("fillAndFlattenPdf", pdfHandle, formDataDict, strict);

        return newPdfHandle;
    }

    public async Task<string> CreateZipFromPdfsAsync(Dictionary<string, string> pdfNamesAndHandles)
    {
        if (pdfNamesAndHandles == null || pdfNamesAndHandles.Count == 0)
        {
            throw new ArgumentException("PDF names and handles cannot be null or empty.", nameof(pdfNamesAndHandles));
        }

        var module = await _moduleTask.Value;
        return await module.InvokeAsync<string>("createZipFromPdfs", pdfNamesAndHandles);
    }

    public async Task DeleteZipUrlAsync(string zipUrl)
    {
        if (string.IsNullOrEmpty(zipUrl))
        {
            return;
        }

        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("deleteZipUrl", zipUrl);
    }

    public async Task ClearAllPdfsAsync()
    {
        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("clearAllPdfs");
    }

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var module = await _moduleTask.Value;
            await module.DisposeAsync();
        }
    }

    public async Task RegisterUnloadListenerAsync()
    {
        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("setupUnloadListener");
    }
}