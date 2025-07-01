import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";

async function seed() {
  try {
    // Inicializar conexão com o banco de dados
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('Conexão com o banco de dados estabelecida');

    // Repositório de usuários
    const userRepository = AppDataSource.getRepository(User);

    // Verificar se já existem usuários
    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log('Usuários já existem no banco de dados. Pulando seed.');
      await AppDataSource.destroy();
      return;
    }

    console.log('Criando usuários...');

    // Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@jurisconnect.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    });
    await userRepository.save(admin);
    console.log('✅ Admin criado: admin@jurisconnect.com / admin123');

    // Cliente
    const clientPassword = await bcrypt.hash('cliente123', 10);
    const client = userRepository.create({
      name: 'João Silva',
      email: 'cliente@exemplo.com',
      password: clientPassword,
      role: 'client',
      status: 'active',
      phone: '(11) 99999-9999',
    });
    await userRepository.save(client);
    console.log('✅ Cliente criado: cliente@exemplo.com / cliente123');

    // Correspondente
    const correspondentPassword = await bcrypt.hash('corresp123', 10);
    const correspondent = userRepository.create({
      name: 'Maria Santos',
      email: 'correspondente@exemplo.com',
      password: correspondentPassword,
      role: 'correspondent',
      status: 'active',
      phone: '(11) 88888-8888',
      oab: 'SP123456',
      city: 'São Paulo',
      state: 'SP',
    });
    await userRepository.save(correspondent);
    console.log('✅ Correspondente criado: correspondente@exemplo.com / corresp123');

    console.log('🎉 Seed executado com sucesso!');
    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

seed();

