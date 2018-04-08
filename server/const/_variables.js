let URL = 'https://edu.cnblogs.com/posts?filter=quality';
const PORT = 4000;
const SERVER_BASE_URL = `http://localhost:${PORT}`;
const MONGO_DB_URL = 'mongodb://localhost:27017/bokeyuan';
const PROXY_SERVER = '183.150.35.133:42347';
const USERNAME = '简智濠';
const PASSWORD = 'Jianzhihao123~';
const IPS_LIST = 'http://piping.mogumiao.com/proxy/api/get_ip_bs?appKey=40a797abf9114947a725411e16bb7bd8&count=10&expiryDate=5&format=1';

module.exports = {
    URL,
    PORT,
    PROXY_SERVER,
    USERNAME,
    PASSWORD,
    SERVER_BASE_URL,
    IPS_LIST,
    MONGO_DB_URL
}