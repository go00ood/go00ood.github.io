'use strict';

var gulp        = require('gulp');

var cryptojs    = require('crypto-js');
const { Transform } = require('node:stream');

// 🔑 환경변수로 비밀번호 지정 (없으면 fallback)
const PASSWORD = process.env.POST_PASSWORD || 'gg';

/*
  layout: encrypted 자동 교정
*/
function enforceEncryptedLayout(frontMatter, filepath) {
  var lines = frontMatter.split('\n');
  var newLines = [];
  var hasLayout = false;
  var fixed = false;

  lines.forEach(function(line) {
    if (line.startsWith('layout:')) {
      hasLayout = true;
      if (!line.includes('encrypted')) {
        newLines.push('layout: encrypted');
        fixed = true;
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  });

  if (!hasLayout) {
    newLines.unshift('layout: encrypted');
    fixed = true;
  }

  if (fixed) {
    console.log('[INFO] ' + filepath + ': layout 자동 수정됨 → encrypted');
  }

  return newLines.join('\n');
}

/*
  암호화 처리
*/
function encrypt(password) {
  return new Transform({ objectMode: true, transform(file, encoding, callback) {
    if (file.isNull() || file.isDirectory()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new Error('Streams are not supported.'));
      return callback();
    }

    if (file.isBuffer()) {
      var delimiter = '---',
          source = String(file.contents),
          match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/),
          originalBody = source,
          frontMatter = 'layout: encrypted';

      if (match) {
        frontMatter = enforceEncryptedLayout(match[1], file.path);
        originalBody = match[2];
      } else if (/^---(?:\r?\n|$)/.test(source)) {
        this.emit('error', new Error(file.path + ': protected file has invalid front matter.'));
        return callback();
      }

      var aesKey = cryptojs.SHA256(password).toString();

      var encryptedBody = cryptojs.AES.encrypt(originalBody, aesKey),
          hmac = cryptojs.HmacSHA256(encryptedBody.toString(), aesKey).toString(),
          encryptedFrontMatter = 'encrypted: ' + hmac + encryptedBody;

      // ✅ 문자열 직접 합치기 (배열 join X)
      var result =
        delimiter + '\n' +
        frontMatter.trim() + '\n' +
        encryptedFrontMatter + '\n' +
        delimiter;

      file.contents = Buffer.from(result);
      this.push(file);
      return callback();
    }
  }});
}


/*
  Gulp tasks
*/
gulp.task('firewall:encrypt', () => {
  return gulp.src('_posts/_protected/*.*')       // 원본 글
    .pipe(encrypt(PASSWORD))              // 암호화
    .pipe(gulp.dest('_posts'));           // 결과 저장
});

gulp.task('firewall:watch', () => {
  gulp.watch('_posts/_protected/*.*', gulp.series('firewall:encrypt'));
});

gulp.task('firewall', gulp.series('firewall:encrypt', 'firewall:watch', () => {}));

gulp.task('default', gulp.series('firewall'));
