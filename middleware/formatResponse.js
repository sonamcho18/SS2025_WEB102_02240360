const formatResponse = (req, res, next) => {
    // Store the original res.json method
    const originalJson = res.json;

    // Override res.json method
    res.json = function(obj) {
        // Check Accept header
        const acceptHeader = req.headers.accept;

        if (acceptHeader && acceptHeader.includes('application/xml')) {
            // Convert to XML if Accept header specifies XML
            const convertToXml = (obj) => {
                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<response>\n';
                
                for (const key in obj) {
                    if (Array.isArray(obj[key])) {
                        xml += `<${key}>\n`;
                        for (const item of obj[key]) {
                            xml += `  <item>${item}</item>\n`;
                        }
                        xml += `</${key}>\n`;
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        xml += `<${key}>\n`;
                        for (const nestedKey in obj[key]) {
                            xml += `  <${nestedKey}>${obj[key][nestedKey]}</${nestedKey}>\n`;
                        }
                        xml += `</${key}>\n`;
                    } else {
                        xml += `<${key}>${obj[key]}</${key}>\n`;
                    }
                }
                
                xml += '</response>';
                return xml;
            };

            // Set content type to XML
            res.set('Content-Type', 'application/xml');
            return res.send(convertToXml(obj));
        } else {
            // Default to JSON
            res.set('Content-Type', 'application/json');
            return originalJson.call(this, obj);
        }
    };

    next();
};

module.exports = formatResponse;