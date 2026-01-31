async function testParams() {
    try {
        console.log('Importing pdfjs-dist...');
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        console.log('PDFJS Loaded');
        
        // Remove workerSrc to simulate what we did in route.ts (or test if it works without it)
        // pdfjsLib.GlobalWorkerOptions.workerSrc = ... // Not setting it

        // Create dummy PDF buffer
        const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/Name /F1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000157 00000 n\n0000000302 00000 n\n0000000392 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n486\n%%EOF';
        const buffer = Buffer.from(dummyPdfContent);
        const uint8Array = new Uint8Array(buffer);
        
        console.log('Loading Document...');
        const loadingTask = pdfjsLib.getDocument({ 
            data: uint8Array
        });
        const pdf = await loadingTask.promise;
        console.log('PDF Loaded. Pages:', pdf.numPages);
        
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        console.log('Text Content Items:', textContent.items.length);
        console.log('First item:', textContent.items[0]?.str);
        
    } catch (e) {
        console.error('PDF Processing Failed:', e);
    }
}

testParams().catch(console.error);
