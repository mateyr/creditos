namespace Creditos.Api.Common.Pagination;

/// <summary>Una página de resultados junto con los datos para navegar entre páginas.</summary>
public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    public PagedResponse<TResult> Map<TResult>(Func<T, TResult> selector) =>
        new([.. Items.Select(selector)], Page, PageSize, TotalCount);
}
