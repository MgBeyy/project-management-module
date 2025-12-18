using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.Drawing;

namespace PMM.Core.Helpers;

public class NpoiExcelHelper
{
    public class RichTextCell
    {
        public string Text { get; set; } = "";
        public List<FontRange> Ranges { get; set; } = new();
    }

    public class FontRange
    {
        public int Start { get; set; }
        public int End { get; set; }
        public string ColorHex { get; set; } = "";
    }

    public class HyperlinkCell
    {
        public string Text { get; set; } = "";
        public string Url { get; set; } = "";
    }

    public byte[] GenerateExcel(List<string> headers, List<List<object>> dataRows, string sheetName = "Data")
    {
        var workbook = new XSSFWorkbook();
        var sheet = workbook.CreateSheet(sheetName);

        // Create header style
        var headerStyle = workbook.CreateCellStyle();
        var headerFont = workbook.CreateFont();
        headerFont.IsBold = true;
        headerFont.FontHeightInPoints = 12;
        headerStyle.SetFont(headerFont);
        headerStyle.FillForegroundColor = IndexedColors.Grey25Percent.Index;
        headerStyle.FillPattern = FillPattern.SolidForeground;

        // Create data style
        var dataStyle = workbook.CreateCellStyle();
        var dataFont = workbook.CreateFont();
        dataFont.Color = IndexedColors.Black.Index;
        dataStyle.SetFont(dataFont);

        // Create header row
        var headerRow = sheet.CreateRow(0);
        for (int i = 0; i < headers.Count; i++)
        {
            var cell = headerRow.CreateCell(i);
            cell.SetCellValue(headers[i]);
            cell.CellStyle = headerStyle;

            // Set column width based on header length (approximate)
            int width = (headers[i].Length + 5) * 256; // Add some padding
            sheet.SetColumnWidth(i, width);
        }

        // Create data rows
        for (int rowIndex = 0; rowIndex < dataRows.Count; rowIndex++)
        {
            var dataRow = sheet.CreateRow(rowIndex + 1);
            var rowData = dataRows[rowIndex];
            for (int colIndex = 0; colIndex < rowData.Count; colIndex++)
            {
                var cell = dataRow.CreateCell(colIndex);
                var value = rowData[colIndex];
                if (value is RichTextCell rtc)
                {
                    var richText = new XSSFRichTextString(rtc.Text);
                    foreach (var range in rtc.Ranges)
                    {
                        var font = (XSSFFont)workbook.CreateFont();
                        if (!string.IsNullOrEmpty(range.ColorHex))
                        {
                            try
                            {
                                var color = ColorTranslator.FromHtml(range.ColorHex);
                                var xssfColor = new XSSFColor();
                                xssfColor.SetRgb(new byte[] { color.R, color.G, color.B });
                                font.SetColor(xssfColor);
                            }
                            catch
                            {
                                // default
                            }
                        }
                        richText.ApplyFont(range.Start, range.End, font);
                    }
                    cell.SetCellValue(richText);
                }
                else if (value is string str)
                {
                    cell.SetCellValue(str);
                    cell.CellStyle = dataStyle;
                }
                else if (value is int intVal)
                {
                    cell.SetCellValue(intVal);
                    cell.CellStyle = dataStyle;
                }
                else if (value is double doubleVal)
                {
                    cell.SetCellValue(doubleVal);
                    cell.CellStyle = dataStyle;
                }
                else if (value is float floatVal)
                {
                    cell.SetCellValue(floatVal);
                    cell.CellStyle = dataStyle;
                }
                else if (value is bool boolVal)
                {
                    cell.SetCellValue(boolVal);
                    cell.CellStyle = dataStyle;
                }
                else if (value is DateTime dateVal)
                {
                    cell.SetCellValue(dateVal);
                    cell.CellStyle = dataStyle;
                }
                else if (value is HyperlinkCell hlc)
                {
                    cell.SetCellValue(hlc.Text);
                    cell.CellStyle = dataStyle;

                    // Create hyperlink
                    var hyperlink = workbook.GetCreationHelper().CreateHyperlink(HyperlinkType.Url);
                    hyperlink.Address = hlc.Url;
                    cell.Hyperlink = hyperlink;

                    // Optional: Style the cell to look like a link (blue, underlined)
                    var linkStyle = workbook.CreateCellStyle();
                    var linkFont = workbook.CreateFont();
                    linkFont.Color = IndexedColors.Blue.Index;
                    linkFont.IsBold = false;
                    linkFont.Underline = FontUnderlineType.Single;
                    linkStyle.SetFont(linkFont);
                    cell.CellStyle = linkStyle;
                }
                else
                {
                    cell.SetCellValue(value?.ToString() ?? "");
                    cell.CellStyle = dataStyle;
                }
            }
        }

        // Write to memory stream
        using var memoryStream = new MemoryStream();
        workbook.Write(memoryStream, false);
        return memoryStream.ToArray();
    }

    public byte[] GenerateExcelWithMultipleSheets(List<(List<string> headers, List<List<object>> dataRows, string sheetName)> sheets)
    {
        var workbook = new XSSFWorkbook();

        foreach (var (headers, dataRows, sheetName) in sheets)
        {
            var sheet = workbook.CreateSheet(sheetName);

            // Create header style
            var headerStyle = workbook.CreateCellStyle();
            var headerFont = workbook.CreateFont();
            headerFont.IsBold = true;
            headerFont.FontHeightInPoints = 12;
            headerStyle.SetFont(headerFont);
            headerStyle.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            headerStyle.FillPattern = FillPattern.SolidForeground;

            // Create data style
            var dataStyle = workbook.CreateCellStyle();
            var dataFont = workbook.CreateFont();
            dataFont.Color = IndexedColors.Black.Index;
            dataStyle.SetFont(dataFont);

            // Create header row
            var headerRow = sheet.CreateRow(0);
            for (int i = 0; i < headers.Count; i++)
            {
                var cell = headerRow.CreateCell(i);
                cell.SetCellValue(headers[i]);
                cell.CellStyle = headerStyle;

                // Set column width based on header length (approximate)
                int width = (headers[i].Length + 5) * 256; // Add some padding
                sheet.SetColumnWidth(i, width);
            }

            // Create data rows
            for (int rowIndex = 0; rowIndex < dataRows.Count; rowIndex++)
            {
                var dataRow = sheet.CreateRow(rowIndex + 1);
                var rowData = dataRows[rowIndex];
                for (int colIndex = 0; colIndex < rowData.Count; colIndex++)
                {
                    var cell = dataRow.CreateCell(colIndex);
                    var value = rowData[colIndex];
                    if (value is RichTextCell rtc)
                    {
                        var richText = new XSSFRichTextString(rtc.Text);
                        foreach (var range in rtc.Ranges)
                        {
                            var font = (XSSFFont)workbook.CreateFont();
                            if (!string.IsNullOrEmpty(range.ColorHex))
                            {
                                try
                                {
                                    var color = ColorTranslator.FromHtml(range.ColorHex);
                                    var xssfColor = new XSSFColor();
                                    xssfColor.SetRgb(new byte[] { color.R, color.G, color.B });
                                    font.SetColor(xssfColor);
                                }
                                catch
                                {
                                    // default
                                }
                            }
                            richText.ApplyFont(range.Start, range.End, font);
                        }
                        cell.SetCellValue(richText);
                    }
                    else if (value is string str)
                    {
                        cell.SetCellValue(str);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is int intVal)
                    {
                        cell.SetCellValue(intVal);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is double doubleVal)
                    {
                        cell.SetCellValue(doubleVal);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is float floatVal)
                    {
                        cell.SetCellValue(floatVal);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is bool boolVal)
                    {
                        cell.SetCellValue(boolVal);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is DateTime dateVal)
                    {
                        cell.SetCellValue(dateVal);
                        cell.CellStyle = dataStyle;
                    }
                    else if (value is HyperlinkCell hlc)
                    {
                        cell.SetCellValue(hlc.Text);
                        cell.CellStyle = dataStyle;

                        // Create hyperlink
                        var hyperlink = workbook.GetCreationHelper().CreateHyperlink(HyperlinkType.Url);
                        hyperlink.Address = hlc.Url;
                        cell.Hyperlink = hyperlink;

                        // Optional: Style the cell to look like a link (blue, underlined)
                        var linkStyle = workbook.CreateCellStyle();
                        var linkFont = workbook.CreateFont();
                        linkFont.Color = IndexedColors.Blue.Index;
                        linkFont.IsBold = false;
                        linkFont.Underline = FontUnderlineType.Single;
                        linkStyle.SetFont(linkFont);
                        cell.CellStyle = linkStyle;
                    }
                    else
                    {
                        cell.SetCellValue(value?.ToString() ?? "");
                        cell.CellStyle = dataStyle;
                    }
                }
            }
        }

        // Write to memory stream
        using var memoryStream = new MemoryStream();
        workbook.Write(memoryStream, false);
        return memoryStream.ToArray();
    }
}