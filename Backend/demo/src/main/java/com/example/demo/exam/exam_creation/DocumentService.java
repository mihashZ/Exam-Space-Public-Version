package com.example.demo.exam.exam_creation;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {
    
    private final List<File> tempFiles = new ArrayList<>();
    
    public static class FileExtractionResult {
        private String fileName;
        private String fileType;
        private String content;
        private boolean success;
        private String errorMessage;
        
        public String getFileName() {
            return fileName;
        }
        
        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
        
        public String getFileType() {
            return fileType;
        }
        
        public void setFileType(String fileType) {
            this.fileType = fileType;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
    
    public Map<String, FileExtractionResult> extractContentFromMultipleFiles(List<MultipartFile> files) {
        Map<String, FileExtractionResult> results = new HashMap<>();
        
        try {
            for (MultipartFile file : files) {
                FileExtractionResult result = new FileExtractionResult();
                
                String fileName = file.getOriginalFilename();
                if (fileName == null) {
                    fileName = "unknown_" + UUID.randomUUID().toString();
                }
                result.setFileName(fileName);
                
                try {
                    String fileExtension = getFileExtension(fileName).toLowerCase();
                    result.setFileType(fileExtension);
                    
                    String extractedContent = extractContent(file);
                    result.setContent(extractedContent);
                    result.setSuccess(true);
                } catch (IOException | IllegalArgumentException e) {
                    result.setSuccess(false);
                    result.setErrorMessage("Error processing file: " + e.getMessage());
                }
                
                results.put(fileName, result);
            }
        } finally {
            cleanupAllTempFiles();
        }
        
        return results;
    }
    
    public String extractContent(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name cannot be null");
        }
        
        String fileExtension = getFileExtension(fileName).toLowerCase();
        byte[] fileContent = file.getBytes();
        
        try {
            String extractedContent = switch (fileExtension) {
                case "pdf" -> {
                    String extractedText = extractFromPdf(fileContent);
                    if (extractedText.contains("[This appears to be an image-only PDF")) {
                        yield extractFromPdfWithOcr(fileContent);
                    } else {
                        yield extractedText;
                    }
                }
                case "docx" -> extractFromDocx(fileContent);
                case "doc" -> "Legacy DOC format is not supported. Please convert to DOCX.";
                case "txt" -> new String(fileContent);
                case "jpg", "jpeg", "png" -> {
                    try {
                        yield extractFromImage(fileContent);
                    } catch (IOException e) {
                        yield "[Failed to process image: " + e.getMessage() + "]";
                    }
                }
                default -> throw new IllegalArgumentException("Unsupported file format: " + fileExtension);
            };

            return cleanExtractedText(extractedContent);
        } catch (Exception e) {
            throw new IOException("Error processing file '" + fileName + "': " + e.getMessage(), e);
        }
    }
    
    private void cleanupAllTempFiles() {
        for (File file : tempFiles) {
            try {
                if (file != null && file.exists()) {
                    Files.deleteIfExists(file.toPath());
                }
            } catch (Exception e) {
                System.err.println("Failed to delete temporary file: " + file.getAbsolutePath() + ": " + e.getMessage());
            }
        }
        tempFiles.clear();
    }
    
    private File createTrackedTempFile(String prefix, String suffix) throws IOException {
        File tempFile = File.createTempFile(prefix, suffix);
        tempFiles.add(tempFile);
        return tempFile;
    }
    
    private String cleanExtractedText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        if (text.startsWith("[This") && text.endsWith("]")) {
            return text; 
        }
        
        String cleaned = text.replace("\r", "");
        
        cleaned = Pattern.compile("\n{2,}").matcher(cleaned).replaceAll(" ");
        cleaned = cleaned.replace("\n", " ");
        cleaned = Pattern.compile("\\s+").matcher(cleaned).replaceAll(" ");
        cleaned = cleaned.trim();
        
        return cleaned;
    }
    
    private String extractFromPdf(byte[] content) throws IOException {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(content))) {
            if (document.isEncrypted()) {
                return "[This PDF is encrypted and cannot be processed]";
            }
            
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document);
            
            if (extractedText == null || extractedText.trim().isEmpty() || extractedText.trim().equals("\r\n")) {
                int imageCount = countImagesInPdf(document);
                if (imageCount > 0) {
                    return "[This appears to be an image-only PDF with " + imageCount + 
                           " images. Consider using OCR processing for this document]";
                } else {
                    return "[No text content could be extracted from this PDF]";
                }
            }
            
            return extractedText;
        }
    }

    private int countImagesInPdf(PDDocument document) {
        try {
            int imageCount = 0;
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                imageCount++;
            }
            return imageCount;
        } catch (Exception e) {
            return 0;
        }
    }
    
    private String extractFromDocx(byte[] content) throws IOException {
        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(content))) {
            XWPFWordExtractor extractor = new XWPFWordExtractor(document);
            return extractor.getText();
        }
    }
    
    private String extractFromImage(byte[] content) throws IOException {
        File tempFile = null;
        try {
            String tempFileName = UUID.randomUUID().toString() + ".png";
            tempFile = createTrackedTempFile(tempFileName, "");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(content);
            }
            return runTesseractLocal(tempFile, "eng");
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private String extractFromPdfWithOcr(byte[] content) throws IOException {
        File tempPdfFile = null;
        try {
            tempPdfFile = createTrackedTempFile("temp_pdf_", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempPdfFile)) {
                fos.write(content);
            }
            return runTesseractLocal(tempPdfFile, "eng");
        } catch (Exception e) {
            throw new IOException("Error performing OCR on PDF via Tesseract: " + e.getMessage(), e);
        } finally {
            if (tempPdfFile != null && tempPdfFile.exists()) {
                tempPdfFile.delete();
            }
        }
    }
    
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }

    private String runTesseractLocal(File inputFile, String lang) throws IOException {
        File outputFile = File.createTempFile("tess_output_", "");
        String outputBase = outputFile.getAbsolutePath();
        outputFile.delete(); 

        String[] cmd = {
            "tesseract",
            inputFile.getAbsolutePath(),
            outputBase,
            "-l", lang
        };

        Process process = new ProcessBuilder(cmd).redirectErrorStream(true).start();
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IOException("Tesseract failed with exit code: " + exitCode);
            }
            File txtFile = new File(outputBase + ".txt");
            if (!txtFile.exists()) {
                throw new IOException("Tesseract output file not found: " + txtFile.getAbsolutePath());
            }
            String result = new String(Files.readAllBytes(txtFile.toPath()));
            txtFile.delete();
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Tesseract was interrupted", e);
        } finally {
            outputFile.delete();
        }
    }
}