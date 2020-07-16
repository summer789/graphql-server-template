/** 打开报错 https://github.com/facebook/jest/issues/5164 */
// const { register } = require('ts-node');
// register({ files: true });
const { setup } = require('./setup');

module.exports = async function () {
  await setup();
  return null;
};
