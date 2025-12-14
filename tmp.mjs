import { testApi } from './test/utils/testApi.js';
const list = await testApi.listTurnos();
const matches = list.filter((t) => String(t.id||'').startsWith('693'));
console.log(matches.length);
console.log(matches);
