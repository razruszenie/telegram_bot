const TelegramApi = require('node-telegram-bot-api')

const Allegro = require('./middleware/allegro')
const Alarmer = require('./middleware/alarmer')

const keys = require('./keys')
const token = keys.TELEGRAM

console.log(token)

const bot = new TelegramApi(token, {polling: true})

// t: type
// v: value
// se: source
// p: page
// o: offset

const start = async () => {

      console.log('Bot started')

      bot.setMyCommands([
            {command: '/start', description: 'Показать меню'},
      ])

      bot.onText(/\/start/, (msg, match) => {

            const chatId = msg.chat.id;
            try {
                  return bot.sendMessage(chatId,
                        '🤔 Вы можете прислать боту запросы в следующем формате:\n\n' +
                        '🚗 Поиск по оригинальному номеру - oem\n' +
                        '└  A1679001014\n');
            } catch (e) {
                  return bot.sendMessage(chatId, 'Произошла какая то ошибка)');
            }
      })

      bot.onText(/\/allegro \d{7,}/, async (msg, match) => {
            const id = msg.text.split(' ')[1];
            const chatId = msg.chat.id;

            await Allegro.getProduct(bot, chatId, id, msg.message_id, 'manager');
      });

      bot.onText(/\S*(\S*([a-zA-Z-]\S*[0-9])|([0-9]\S*[a-zA-Z-]))\S*|[0-9]{5,}/, (msg, match) => {

            if(!msg.text.includes("/")){
                  const chatId = msg.chat.id;

                  if(msg.text.length < 23){
                        try {
                              bot.sendMessage(chatId, 'Выберите состояние запчасти', {
                                    reply_markup: {
                                          inline_keyboard: [
                                                [
                                                      {
                                                            text: 'Б/у(контрактные)',
                                                            callback_data: JSON.stringify(
                                                                  {
                                                                        t: 'oem',
                                                                        v: 'u',
                                                                        oem: msg.text
                                                                  })
                                                      },
                                                      {
                                                            text: 'Новые',
                                                            callback_data: JSON.stringify(
                                                                  {
                                                                        t: 'oem',
                                                                        v: 'n',
                                                                        oem: msg.text
                                                                  })
                                                      }
                                                ]
                                          ]
                                    }
                              });
                        }catch(e) {
                              return bot.sendMessage(chatId, 'Произошла какая то ошибка)');
                        }
                  }else{
                        return bot.sendMessage(chatId, 'Оригинальный номер слишком длинный, попробуйте его сократить');
                  }
            }

      });

      bot.on('callback_query', async query => {

            const chatId = query.message.chat.id;
            const parseData = JSON.parse(query.data)

            if(parseData.t === 'oem'){
                  let offset = parseData.o;
                  if(!offset){
                        offset = 0
                  }
                  let page = parseData.p;
                  if(!page){
                        page = 1
                  }
                  await Allegro.getProducts(bot, chatId, parseData.oem, parseData.v, page, offset);
            }
            else if(parseData.t === 'more'){
                  if(parseData.se === 'al'){
                        console.log(parseData)
                        await Allegro.getProduct(bot, chatId, parseData.id, query.message.message_id, 'user');
                  }
            }
            else if(parseData.t === 'man'){
                  if(query.message.chat.username){
                        await Alarmer.sendNotification('Пользователь - @' + query.message.chat.username +
                              '\nИсточник - ' + parseData.se + '\nАртикул - ' + parseData.id)
                        await bot.sendMessage(chatId,
                              'Ожидайте. Менеджер свяжеться с Вами в кратчайшие сроки')
                  }
                  else{
                        await Alarmer.sendNotification('Пользователь - tg://user?id=' +
                              query.message.chat.id + '\nИсточник - ' + parseData.se +
                              '\nАртикул - ' + parseData.id)
                        await bot.sendMessage(chatId,
                              'К сожалению у Вас закрытый аккаунт, поэтому мы не можем с Вами связаться. ' +
                              'Для полнецнного использования сервиса измените настройки приватности')
                  }
            }

      })
}

start()