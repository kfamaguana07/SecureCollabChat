// ... (imports de express, cors, etc.)

const adminRouter = require('./routers/adminRouter');
const salaRouter = require('./routers/salaRouter');

const app = express();
app.use(express.json());
app.use(cors());

// Registro de rutas con prefijos
app.use('/api/admin', adminRouter);
app.use('/api/salas', salaRouter);

// ... (resto del código de sockets y sequelize)