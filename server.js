// const updns = require('updns').createServer(1153, '127.0.0.1')

// updns.on('error', error => {
//     console.log(error)
// })

// updns.on('listening', server => {
//     console.log('DNS service has started')
// })

// updns.on('message', (domain, send, proxy) => {
//     console.log(`q ${domain}`);
//     if(domain === 'google.com'){
//         send('123.123.123.123')
//     }else {
//         send('8.8.8.8')
//     }
// })

const dns = require('dnsfun');
const ipParse = require("ip-parse");

var server = dns.Create();

server.on_message((request) => {

    var response = request.createResponse();
    // respond with not implemented to opcode different than query

    if (request.flagsDecoded.opcode != dns.OPCODE.QUERY) {
        response.flags = {
            response: true,
            opcode: request.flagsDecoded.opcode,
            replyCode: dns.RCODE.NOTIMPL
        };
        server.send(resp);
        return;
    }

    // respond with embedded IP to all A queries
    for (const query of request.queries) {
        if ((query.type == dns.TYPE.A) && (query.class == dns.CLASS.IN)) {
            const parts = query.nameString.split(".");
            if (parts.length >= 6) {
                const resIp = ipParse.parseIp(`${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`);
                console.log(`Q ${query.nameString}`);
                response.answers.push({
                    name: query.name,
                    type: dns.TYPE.A,
                    class: dns.CLASS.IN,
                    ttl: 300,
                    data: resIp
                });
            }
        }
    }

    if (response.answers.length > 0) {
        response.flags.replyCode = dns.RCODE.NOERROR;
        authoritativeAnswer = true;
    } else {
        response.flags.replyCode = dns.RCODE.NAMEERROR;
    }
    server.send(response);
});

server.bind('udp6', port = 53, block = true);