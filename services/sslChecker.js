const sslChecker = require('ssl-checker');
const https = require('https');
const tls = require('tls');

const checkSSL = async (hostname) => {
  try {
    const cleanHostname = hostname.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    const sslInfo = await sslChecker(cleanHostname, {
      method: 'GET',
      port: 443,
      protocol: 'https:'
    });

    const tlsVersion = await getTLSVersion(cleanHostname);
    const mixedContent = await checkMixedContent(hostname);

    const daysRemaining = sslInfo.daysRemaining;
    let validityStatus = 'valid';
    if (daysRemaining < 0) {
      validityStatus = 'expired';
    } else if (daysRemaining < 30) {
      validityStatus = 'expiring-soon';
    }

    return {
      success: true,
      data: {
        valid: sslInfo.valid,
        validFrom: sslInfo.validFrom,
        validTo: sslInfo.validTo,
        daysRemaining: sslInfo.daysRemaining,
        validityStatus: validityStatus,
        issuer: {
          country: sslInfo.issuer?.country || 'N/A',
          organization: sslInfo.issuer?.organization || 'N/A',
          commonName: sslInfo.issuer?.commonName || 'N/A'
        },
        httpsSupport: true,
        tlsVersion: tlsVersion,
        chainTrust: sslInfo.valid ? 'trusted' : 'untrusted',
        mixedContent: mixedContent,
        secureConnection: sslInfo.valid && tlsVersion !== 'TLSv1' && tlsVersion !== 'TLSv1.1'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to check SSL certificate'
    };
  }
};

const getTLSVersion = (hostname) => {
  return new Promise((resolve) => {
    const socket = tls.connect(443, hostname, {
      rejectUnauthorized: false
    }, () => {
      const version = socket.getProtocol();
      socket.end();
      resolve(version);
    });

    socket.on('error', () => {
      resolve('Unknown');
    });

    setTimeout(() => {
      socket.destroy();
      resolve('Unknown');
    }, 5000);
  });
};

const checkMixedContent = async (url) => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    return new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.length > 50000) {
            res.destroy();
          }
        });

        res.on('end', () => {
          const hasMixedContent = /src=["']http:\/\//.test(data) || /href=["']http:\/\//.test(data);
          resolve(hasMixedContent);
        });
      }).on('error', () => {
        resolve(false);
      });

      setTimeout(() => {
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    return false;
  }
};

module.exports = { checkSSL };
