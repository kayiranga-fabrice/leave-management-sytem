// Raspberry Pi Dashboard Configuration
module.exports = {
    dashboardIp: process.env.PI_DASHBOARD_IP || '192.168.1.42',
    dashboardPort: process.env.PI_DASHBOARD_PORT || '5000'
};
