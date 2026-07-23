package com.nexushr.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.nexushr.dto.PayrollDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;

@Service
public class PayslipService {

    @Value("${company.name:NexusHR Enterprise}")
    private String companyNameProperty;

    @Value("${company.address:123 Enterprise Way, Tech City}")
    private String companyAddressProperty;

    public byte[] generatePayslipPdf(PayrollDTO payroll) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Company Details
            Paragraph companyName = new Paragraph(companyNameProperty, titleFont);
            companyName.setAlignment(Element.ALIGN_CENTER);
            document.add(companyName);

            Paragraph companyAddress = new Paragraph(companyAddressProperty, normalFont);
            companyAddress.setAlignment(Element.ALIGN_CENTER);
            document.add(companyAddress);
            
            document.add(new Paragraph("\nPayslip for " + getMonthName(payroll.getPayrollMonth()) + " " + payroll.getPayrollYear(), headerFont));
            document.add(new Paragraph("\n"));

            // Employee Details
            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingBefore(10f);
            
            addCell(empTable, "Employee Name:", headerFont);
            addCell(empTable, payroll.getEmployeeName(), normalFont);
            
            addCell(empTable, "Employee ID:", headerFont);
            addCell(empTable, String.valueOf(payroll.getEmployeeId()), normalFont);
            
            addCell(empTable, "Designation:", headerFont);
            addCell(empTable, payroll.getPosition() != null ? payroll.getPosition() : "N/A", normalFont);
            
            addCell(empTable, "Payslip Number:", headerFont);
            addCell(empTable, payroll.getPayslipNumber(), normalFont);
            
            document.add(empTable);
            document.add(new Paragraph("\n"));

            // Salary Breakdown Table
            PdfPTable salaryTable = new PdfPTable(2);
            salaryTable.setWidthPercentage(100);
            salaryTable.setSpacingBefore(10f);

            PdfPCell earningsCell = new PdfPCell(new Phrase("Earnings", headerFont));
            earningsCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            earningsCell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            salaryTable.addCell(earningsCell);

            PdfPCell deductionsCell = new PdfPCell(new Phrase("Deductions", headerFont));
            deductionsCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            deductionsCell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            salaryTable.addCell(deductionsCell);

            addCell(salaryTable, "Gross Salary: " + payroll.getGrossSalary(), normalFont);
            addCell(salaryTable, "Total Taxes: " + payroll.getTotalTaxes(), normalFont);
            
            addCell(salaryTable, "", normalFont); // Empty for alignment
            addCell(salaryTable, "Other Deductions: " + (payroll.getTotalDeductions().subtract(payroll.getTotalTaxes())), normalFont);

            document.add(salaryTable);
            document.add(new Paragraph("\n"));

            // Net Pay
            Paragraph netPay = new Paragraph("Net Pay: " + payroll.getNetSalary(), headerFont);
            netPay.setAlignment(Element.ALIGN_RIGHT);
            document.add(netPay);
            
            // Footer
            document.add(new Paragraph("\n\n"));
            Paragraph footer = new Paragraph("Generated Date: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private String getMonthName(int month) {
        return java.time.Month.of(month).name();
    }
}
