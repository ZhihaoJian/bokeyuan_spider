(function () {
    var xhr = new XMLHttpRequest(),
        canvas = document.getElementById('data-canvas'),
        data = '',
        wordList = []

    xhr.open('GET', '/data', true);
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            data = JSON.parse(xhr.responseText);
            data = data.replace(/\[|\"|\]/g, '');
            data = data.split(',');

            for (let index = 1, length = data.length; index < length; index += 2) {
                const word = data[index - 1],
                    count = parseInt(data[index]);
                if (word.match(/[^a-zA-Z0-9]/)) {
                    wordList.push([word, count])
                }
            }

            wordList = wordList.sort(function (a, b) {
                if (a[1] < b[1]) {
                    return 1;
                }else if(a[1] > b[1]){
                    return -1;
                }
            })

            WordCloud(document.getElementById('test'), {
                list: wordList,
                minRotation: 0,
                maxRotation: 90
            });
        }
    };
    xhr.send();
})()