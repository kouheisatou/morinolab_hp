const fs = require('fs');
const path = require('path');

// CSVファイルを読み込んでIDを取得する関数
function readCSVIds(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const ids = [];

    // ヘッダー行をスキップして、各行からIDを取得
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        const id = columns[0]; // 最初の列がID
        if (id && id !== 'id') {
          ids.push(id);
        }
      }
    }

    return ids;
  } catch (error) {
    console.error(`Error reading CSV file ${csvPath}:`, error);
    return [];
  }
}

function generateStaticPages() {
  try {
    // 各CSVファイルからIDを取得
    const newsIds = readCSVIds('public/generated_contents/news/news.csv');
    const lectureIds = readCSVIds(
      'public/generated_contents/lecture/lecture.csv'
    );
    const publicationIds = readCSVIds(
      'public/generated_contents/publication/publication.csv'
    );
    const memberIds = readCSVIds('public/generated_contents/member/member.csv');

    console.log('News IDs:', newsIds);
    console.log('Lecture IDs:', lectureIds);
    console.log('Publication IDs:', publicationIds);
    console.log('Member IDs:', memberIds);

    // 静的ページのリストを生成
    const staticPages = [
      ...newsIds.map((id) => `/news/${id}`),
      ...lectureIds.map((id) => `/lectures/${id}`),
      ...publicationIds.map((id) => `/publications/${id}`),
      ...memberIds.map((id) => `/team/${id}`),
    ];

    console.log('Static pages to generate:', staticPages.length);
    console.log(staticPages);
  } catch (error) {
    console.error('Error generating static pages:', error);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  generateStaticPages();
}

module.exports = { generateStaticPages, readCSVIds };
