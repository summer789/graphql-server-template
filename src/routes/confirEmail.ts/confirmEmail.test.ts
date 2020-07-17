import axios from 'axios';

it('check confirm email invalid', async () => {
  const response = await axios.get(`${process.env.TEST_HOST}/confirm/-1`);
  const text = response.data;
  expect(text).toEqual('invalid');
});
