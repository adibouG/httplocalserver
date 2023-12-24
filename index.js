import http from "http";
import url from "url";
import path from "path";
import fs from "fs";

import mime from 'mime';
import {fileTypeFromBuffer, fileTypeFromFile} from 'file-type';

const PORT = process.argv.length > 2 ? process.argv[2] : 8888 ;
const FOLDER2SERVE = process.argv.length > 3 ? process.argv[3] : process.cwd();

http.createServer((request, response) => {
 
    const uri = url.parse(request.url).pathname; 
    let filename = path.join(FOLDER2SERVE, uri);
  
    fs.open(filename, (exists) =>  {
        if(!exists) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
        
        let mimeType = mime.getType(filename);
 
        fs.readFile(filename, "binary", async function(err, file) {
            if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }
            /* in case the file type was not determined */
            if (!mimeType) {
                mimeType = await fileTypeFromFile(filename);
            }
            /* still not so try another way   */
            if (!mimeType) {
                mimeType = await fileTypeFromBuffer(Buffer.from(file, 'binary'));
            } 
            /* still not ... then let's default to  */ 
            if (!mimeType) {
                mimeType = 'text/plain';
            }
      
            response.writeHead(200, { "Content-Type": mimeType });
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(PORT, 10));

console.log(`server running at http://localhost:${PORT}\nCTRL + C to shutdown`);