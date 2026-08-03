package com.nexushr.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.nexushr.dto.AttendanceDTO;
import com.nexushr.dto.PayrollDTO;
import com.nexushr.dto.PayrollEmployeeDTO;
import com.nexushr.entity.Payroll;
import com.nexushr.entity.PayrollComponent;
import com.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayslipService {

    private final PayrollRepository payrollRepository;
    private final EmployeeClient employeeClient;
    private final AttendanceService attendanceService;

    @Value("${company.name:NexusHR Enterprise}")
    private String companyName;

    @Value("${company.address:123 Enterprise Way, Tech City}")
    private String companyAddress;
    
    @Value("${company.email:contact@nexushr.com}")
    private String companyEmail;
    
    @Value("${company.phone:+1-800-NEXUS-HR}")
    private String companyPhone;

    public byte[] generatePayslipPdf(PayrollDTO payrollDto) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Setup Fonts
            Font companyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(44, 62, 80)); // Dark Blue/Gray
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(44, 62, 80));
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(41, 128, 185)); // Professional Blue
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);

            Payroll payrollEntity = payrollRepository.findById(payrollDto.getId())
                    .orElseThrow(() -> new RuntimeException("Payroll not found"));

            PayrollEmployeeDTO employee = employeeClient.getPayrollEmployeeById(payrollEntity.getEmployeeId());

            LocalDate startDate = LocalDate.of(payrollEntity.getPayrollYear(), payrollEntity.getPayrollMonth(), 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            List<AttendanceDTO> attendanceList = attendanceService.getEmployeeAttendance(payrollEntity.getEmployeeId(), startDate, endDate);

            drawHeader(document, companyFont, normalFont, titleFont, payrollEntity);
            drawDocumentInfo(document, normalFont, boldFont, payrollEntity);
            drawEmployeeCard(document, boldFont, normalFont, sectionFont, payrollEntity, employee);
            drawAttendanceSection(document, boldFont, normalFont, sectionFont, attendanceList, startDate);
            drawEarningsAndDeductions(document, boldFont, normalFont, sectionFont, payrollEntity);
            drawNetPaySection(document, payrollEntity);
            drawFooter(document, smallFont);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void drawHeader(Document document, Font companyFont, Font normalFont, Font titleFont, Payroll payroll) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60f, 40f});
        headerTable.setSpacingAfter(10f);

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.BOTTOM);
        leftCell.setBorderColor(Color.LIGHT_GRAY);
        leftCell.setBorderWidthBottom(1f);
        leftCell.setPaddingBottom(10f);
        
        leftCell.addElement(new Paragraph(companyName, companyFont));
        leftCell.addElement(new Paragraph(companyAddress, normalFont));
        leftCell.addElement(new Paragraph("Email: " + companyEmail + " | Phone: " + companyPhone, normalFont));
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.BOTTOM);
        rightCell.setBorderColor(Color.LIGHT_GRAY);
        rightCell.setBorderWidthBottom(1f);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightCell.setPaddingBottom(10f);
        
        Paragraph payslipTitle = new Paragraph("PAYSLIP", companyFont);
        payslipTitle.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(payslipTitle);
        
        Paragraph monthYear = new Paragraph(getMonthName(payroll.getPayrollMonth()) + " " + payroll.getPayrollYear(), titleFont);
        monthYear.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(monthYear);
        
        headerTable.addCell(rightCell);
        document.add(headerTable);
    }

    private void drawDocumentInfo(Document document, Font normalFont, Font boldFont, Payroll payroll) throws DocumentException {
        PdfPTable infoTable = new PdfPTable(4);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(15f);

        addCell(infoTable, "Payslip No:", boldFont, Element.ALIGN_LEFT);
        addCell(infoTable, payroll.getPayslipNumber(), normalFont, Element.ALIGN_LEFT);
        addCell(infoTable, "Payment Status:", boldFont, Element.ALIGN_LEFT);
        addCell(infoTable, payroll.getStatus().name(), normalFont, Element.ALIGN_LEFT);

        addCell(infoTable, "Generated Date:", boldFont, Element.ALIGN_LEFT);
        addCell(infoTable, payroll.getGeneratedAt() != null ? payroll.getGeneratedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : LocalDate.now().toString(), normalFont, Element.ALIGN_LEFT);
        addCell(infoTable, "Payment Date:", boldFont, Element.ALIGN_LEFT);
        addCell(infoTable, payroll.getPaymentDate() != null ? payroll.getPaymentDate().toString() : "-", normalFont, Element.ALIGN_LEFT);

        document.add(infoTable);
    }

    private void drawEmployeeCard(Document document, Font boldFont, Font normalFont, Font sectionFont, Payroll payroll, PayrollEmployeeDTO employee) throws DocumentException {
        PdfPTable wrapperTable = new PdfPTable(1);
        wrapperTable.setWidthPercentage(100);
        wrapperTable.setSpacingAfter(15f);
        
        PdfPCell wrapperCell = new PdfPCell();
        wrapperCell.setBorderColor(Color.LIGHT_GRAY);
        wrapperCell.setBorderWidth(1f);
        wrapperCell.setPadding(10f);
        
        Paragraph sectionTitle = new Paragraph("EMPLOYEE INFORMATION", sectionFont);
        sectionTitle.setSpacingAfter(8f);
        wrapperCell.addElement(sectionTitle);

        PdfPTable empTable = new PdfPTable(4);
        empTable.setWidthPercentage(100);

        addCell(empTable, "Employee Name:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, payroll.getEmployeeName(), normalFont, Element.ALIGN_LEFT);
        addCell(empTable, "Employee ID:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, payroll.getEmployeeCode(), normalFont, Element.ALIGN_LEFT);

        addCell(empTable, "Department:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, payroll.getDepartmentName(), normalFont, Element.ALIGN_LEFT);
        addCell(empTable, "Designation:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, payroll.getDesignationName(), normalFont, Element.ALIGN_LEFT);

        addCell(empTable, "Joining Date:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, employee.getJoiningDate() != null ? employee.getJoiningDate().toString() : "N/A", normalFont, Element.ALIGN_LEFT);
        addCell(empTable, "Email:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, employee.getEmail() != null ? employee.getEmail() : "N/A", normalFont, Element.ALIGN_LEFT);

        String managerName = employee.getManagerName();
        if (managerName == null || managerName.trim().isEmpty() || "N/A".equalsIgnoreCase(managerName)) {
            managerName = "Self-Managed";
        }
        
        addCell(empTable, "Manager:", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, managerName, normalFont, Element.ALIGN_LEFT);
        addCell(empTable, "", boldFont, Element.ALIGN_LEFT);
        addCell(empTable, "", normalFont, Element.ALIGN_LEFT);

        wrapperCell.addElement(empTable);
        wrapperTable.addCell(wrapperCell);
        document.add(wrapperTable);
    }

    private void drawAttendanceSection(Document document, Font boldFont, Font normalFont, Font sectionFont, List<AttendanceDTO> attendanceList, LocalDate startDate) throws DocumentException {
        int totalDays = startDate.lengthOfMonth();
        long workingDays = java.util.stream.IntStream.rangeClosed(1, totalDays)
                .mapToObj(startDate::withDayOfMonth)
                .filter(d -> d.getDayOfWeek() != java.time.DayOfWeek.SATURDAY && d.getDayOfWeek() != java.time.DayOfWeek.SUNDAY)
                .count();

        long presentDays = attendanceList.stream()
                .filter(a -> "present".equalsIgnoreCase(a.getStatus()) || "late".equalsIgnoreCase(a.getStatus()))
                .count();

        long absentDays = workingDays > presentDays ? workingDays - presentDays : 0;
        
        long overtimeHours = 0;
        // Approximation if we don't have accurate overtime in DB
        
        PdfPTable wrapperTable = new PdfPTable(1);
        wrapperTable.setWidthPercentage(100);
        wrapperTable.setSpacingAfter(15f);

        PdfPCell wrapperCell = new PdfPCell();
        wrapperCell.setBorderColor(Color.LIGHT_GRAY);
        wrapperCell.setBorderWidth(1f);
        wrapperCell.setPadding(10f);
        
        Paragraph sectionTitle = new Paragraph("ATTENDANCE SUMMARY", sectionFont);
        sectionTitle.setSpacingAfter(8f);
        wrapperCell.addElement(sectionTitle);

        PdfPTable attTable = new PdfPTable(6);
        attTable.setWidthPercentage(100);
        
        addCell(attTable, "Working Days:", boldFont, Element.ALIGN_LEFT);
        addCell(attTable, String.valueOf(workingDays), normalFont, Element.ALIGN_LEFT);
        
        addCell(attTable, "Present Days:", boldFont, Element.ALIGN_LEFT);
        addCell(attTable, String.valueOf(presentDays), normalFont, Element.ALIGN_LEFT);
        
        addCell(attTable, "Absent/LOP:", boldFont, Element.ALIGN_LEFT);
        addCell(attTable, String.valueOf(absentDays), normalFont, Element.ALIGN_LEFT);

        wrapperCell.addElement(attTable);
        wrapperTable.addCell(wrapperCell);
        document.add(wrapperTable);
    }

    private void drawEarningsAndDeductions(Document document, Font boldFont, Font normalFont, Font sectionFont, Payroll payroll) throws DocumentException {
        PdfPTable mainTable = new PdfPTable(2);
        mainTable.setWidthPercentage(100);
        mainTable.setSpacingAfter(15f);
        mainTable.setWidths(new float[]{50f, 50f});

        // Left Table: Earnings
        PdfPTable earningsTable = new PdfPTable(2);
        earningsTable.setWidthPercentage(100);
        
        PdfPCell eHeader1 = new PdfPCell(new Phrase("EARNINGS", sectionFont));
        eHeader1.setBackgroundColor(new Color(245, 247, 250));
        eHeader1.setBorderColor(Color.LIGHT_GRAY);
        eHeader1.setPadding(8f);
        
        PdfPCell eHeader2 = new PdfPCell(new Phrase("AMOUNT (₹)", sectionFont));
        eHeader2.setBackgroundColor(new Color(245, 247, 250));
        eHeader2.setBorderColor(Color.LIGHT_GRAY);
        eHeader2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        eHeader2.setPadding(8f);
        
        earningsTable.addCell(eHeader1);
        earningsTable.addCell(eHeader2);

        // Right Table: Deductions
        PdfPTable deductionsTable = new PdfPTable(2);
        deductionsTable.setWidthPercentage(100);
        
        PdfPCell dHeader1 = new PdfPCell(new Phrase("DEDUCTIONS", sectionFont));
        dHeader1.setBackgroundColor(new Color(245, 247, 250));
        dHeader1.setBorderColor(Color.LIGHT_GRAY);
        dHeader1.setPadding(8f);
        
        PdfPCell dHeader2 = new PdfPCell(new Phrase("AMOUNT (₹)", sectionFont));
        dHeader2.setBackgroundColor(new Color(245, 247, 250));
        dHeader2.setBorderColor(Color.LIGHT_GRAY);
        dHeader2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        dHeader2.setPadding(8f);
        
        deductionsTable.addCell(dHeader1);
        deductionsTable.addCell(dHeader2);

        // Populate components
        List<PayrollComponent> earnings = payroll.getComponents().stream()
                .filter(c -> "EARNING".equalsIgnoreCase(c.getComponentType().name()))
                .collect(Collectors.toList());
                
        List<PayrollComponent> deductions = payroll.getComponents().stream()
                .filter(c -> "DEDUCTION".equalsIgnoreCase(c.getComponentType().name()))
                .collect(Collectors.toList());
                
        int maxRows = Math.max(earnings.size(), deductions.size());
        
        boolean alternate = false;
        for (int i = 0; i < maxRows; i++) {
            Color rowColor = alternate ? new Color(252, 252, 252) : Color.WHITE;
            
            // Earnings row
            if (i < earnings.size()) {
                PayrollComponent c = earnings.get(i);
                addCellWithBg(earningsTable, c.getName(), normalFont, Element.ALIGN_LEFT, rowColor);
                addCellWithBg(earningsTable, String.format("%,.2f", c.getAmount()), normalFont, Element.ALIGN_RIGHT, rowColor);
            } else {
                addCellWithBg(earningsTable, "", normalFont, Element.ALIGN_LEFT, rowColor);
                addCellWithBg(earningsTable, "", normalFont, Element.ALIGN_RIGHT, rowColor);
            }
            
            // Deductions row
            if (i < deductions.size()) {
                PayrollComponent c = deductions.get(i);
                addCellWithBg(deductionsTable, c.getName(), normalFont, Element.ALIGN_LEFT, rowColor);
                addCellWithBg(deductionsTable, String.format("%,.2f", c.getAmount()), normalFont, Element.ALIGN_RIGHT, rowColor);
            } else {
                addCellWithBg(deductionsTable, "", normalFont, Element.ALIGN_LEFT, rowColor);
                addCellWithBg(deductionsTable, "", normalFont, Element.ALIGN_RIGHT, rowColor);
            }
            alternate = !alternate;
        }

        // Totals
        Color totalBg = new Color(236, 240, 241);
        addCellWithBg(earningsTable, "Total Earnings", boldFont, Element.ALIGN_LEFT, totalBg);
        addCellWithBg(earningsTable, String.format("%,.2f", payroll.getGrossSalary()), boldFont, Element.ALIGN_RIGHT, totalBg);
        
        addCellWithBg(deductionsTable, "Total Deductions", boldFont, Element.ALIGN_LEFT, totalBg);
        addCellWithBg(deductionsTable, String.format("%,.2f", payroll.getTotalDeductions()), boldFont, Element.ALIGN_RIGHT, totalBg);

        // Add to main table
        PdfPCell leftMain = new PdfPCell(earningsTable);
        leftMain.setBorder(Rectangle.NO_BORDER);
        leftMain.setPaddingRight(5f);
        
        PdfPCell rightMain = new PdfPCell(deductionsTable);
        rightMain.setBorder(Rectangle.NO_BORDER);
        rightMain.setPaddingLeft(5f);

        mainTable.addCell(leftMain);
        mainTable.addCell(rightMain);

        document.add(mainTable);
    }

    private void drawNetPaySection(Document document, Payroll payroll) throws DocumentException {
        PdfPTable netTable = new PdfPTable(1);
        netTable.setWidthPercentage(100);
        netTable.setSpacingAfter(20f);
        
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(232, 244, 253)); // Soft blue background
        cell.setBorderColor(new Color(41, 128, 185));
        cell.setBorderWidth(1.5f);
        cell.setPadding(15f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Font netTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(44, 62, 80));
        Font netAmountFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(41, 128, 185));
        Font netWordsFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11, Color.DARK_GRAY);

        Paragraph title = new Paragraph("NET PAY", netTitleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        
        Paragraph amount = new Paragraph(String.format("₹ %,.2f", payroll.getNetSalary()), netAmountFont);
        amount.setAlignment(Element.ALIGN_CENTER);
        amount.setSpacingBefore(5f);
        
        Paragraph words = new Paragraph(convertAmountToWords(payroll.getNetSalary()), netWordsFont);
        words.setAlignment(Element.ALIGN_CENTER);
        words.setSpacingBefore(5f);

        cell.addElement(title);
        cell.addElement(amount);
        cell.addElement(words);
        
        netTable.addCell(cell);
        document.add(netTable);
    }

    private void drawFooter(Document document, Font smallFont) throws DocumentException {
        Paragraph disclaimer = new Paragraph("This is a computer-generated payslip and does not require a signature.", smallFont);
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        disclaimer.setSpacingBefore(30f);
        document.add(disclaimer);
        
        Paragraph timestamp = new Paragraph("Generated on: " + LocalDate.now().toString(), smallFont);
        timestamp.setAlignment(Element.ALIGN_CENTER);
        document.add(timestamp);
    }

    private void addCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(alignment);
        cell.setPaddingBottom(5f);
        table.addCell(cell);
    }

    private void addCellWithBg(PdfPTable table, String text, Font font, int alignment, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setBorderColor(Color.LIGHT_GRAY);
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private String getMonthName(int month) {
        return java.time.Month.of(month).name();
    }
    
    private String convertAmountToWords(BigDecimal amount) {
        // Simplified fallback for number to words
        long rupees = amount.longValue();
        int paise = amount.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).intValue();
        
        String rsWords = convertNumberToWords(rupees) + " Rupees";
        if (paise > 0) {
            rsWords += " and " + convertNumberToWords(paise) + " Paise";
        }
        return rsWords + " Only";
    }
    
    private String convertNumberToWords(long number) {
        if (number == 0) return "Zero";
        
        String[] units = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                          "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
        String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
        
        if (number < 20) return units[(int)number];
        if (number < 100) return tens[(int)(number / 10)] + ((number % 10 != 0) ? " " + units[(int)(number % 10)] : "");
        if (number < 1000) return units[(int)(number / 100)] + " Hundred" + ((number % 100 != 0) ? " " + convertNumberToWords(number % 100) : "");
        if (number < 100000) return convertNumberToWords(number / 1000) + " Thousand" + ((number % 1000 != 0) ? " " + convertNumberToWords(number % 1000) : "");
        if (number < 10000000) return convertNumberToWords(number / 100000) + " Lakh" + ((number % 100000 != 0) ? " " + convertNumberToWords(number % 100000) : "");
        return convertNumberToWords(number / 10000000) + " Crore" + ((number % 10000000 != 0) ? " " + convertNumberToWords(number % 10000000) : "");
    }
}
