const execSync = require('child_process').execSync;
const fs = require('fs');

const args = process.argv;
console.log(args);

const apiName = args.filter((arg) => arg.match(new RegExp('--name=')))[0].split('=')[1];

// API_PATH 가 없으면 base.ts 에 문자열 "undefined" 가 박혀 런타임에 상대경로 요청이 나간다.
// 조용히 깨지는 대신 생성 단계에서 멈춘다.
if (!process.env.API_PATH) {
  console.error(
    '[generate-api] API_PATH 환경변수가 필요합니다.\n' +
      `  예) API_PATH=https://api2.okdohyuk.dev yarn generate-api -- --name=${apiName}`,
  );
  process.exit(1);
}

let basePath = `"${process.env.API_PATH}"`;

console.log('Run openapi-generator...');

execSync(
  `rm -rf src/spec/api/${apiName} && openapi-generator-cli generate -i api-spec/reference/${apiName}.yaml --generator-name typescript-axios -o src/spec/api/${apiName} --skip-validate-spec`,
  { stdio: 'inherit' },
);

fs.readFile(`src/spec/api/${apiName}/base.ts`, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }

  var result = data.replace(/"http:\/\/localhost:3000"/g, basePath);

  fs.writeFile(`src/spec/api/${apiName}/base.ts`, result, 'utf8', (err) => {
    if (err) return console.log(err);
  });
});
