const express = require('express')

const app = express();
// delete 를 사용할 때, const 상수로 지정하면 에러가 뜬다.
// let members = require('./members') // 직원 정보 배열을 가지고 있었던 코드
const db = require('./models/index'); // /index 를 빼도, 알아서 찾는다. db 객체를 가져오고
const member = require('./models/member');
const { Member } = db; // db 객체의 Member Model 를 꺼낸다.

app.use(express.json());

// middleware : server 로 부터 오는 req 에 관해 필요한 것을 처리해준다.
app.use(express.json()); // server 로 부터온 req 의 body 에 json 이 존재할 경우에 그것을 추출해서 req.body 프로퍼티의 값으로 지정해 주는 것이다. 

// Request url의 path가 /hello 를 만족하면 실행되는 call-back 함수
// route handler / Req : Client 가 받은 request / res : response 를 보낼 수 있다.
app.get('/api/members', async (req, res) => {
    const { team } = req.query; // const team = req.query.team; // URL 의 query 에서 team 의 파라미터를 가져오는 
    if (team) {
        const teamMembers = await Member.findAll({ 
            where: {team : team},
            order :[['admissionDate', DESC]],
        }); // 배열의 filter Method 는 배열을 순회하면서 인자로 들어오는 콜벡이 true 인 값을 리턴
        res.send(teamMembers)
    } else {
        const members = await Member.findAll(); 
        res.send(members); // send method 에는 다양한 타입의 값들을 담을 수 있다.
    }
});

// :id -> Route Parameter == 중요 => path로 req 가 온다고 해서 항상 실행되는 것이 아니다. 
// req 의 method 가 get 이어야 한다.
app.get('/api/members/:id', async (req, res) => {
    const { id } = req.params; // const {id} = req.params
    const member = await Member.findOne({
        where: {id : id}
    });
    // test) const member = members.find((m) => m.id === Number(id)); // 배열의 find method 를 사용한 것임. // => 뒤의 요소 중에서 첫 번째 요소를 의미함. + string type 을 number 로 변환
    if (member) {
        res.send(member);
    } else {
        res.status(404).send({ message : 'There is no member with the id!!' }); // {}객체에 message
    }
});
// POST request 를 처리할 수 있게 된다.
app.post('/api/members', async (req, res) => {
    // console.log(req.body); // 새로운 정보가 담겨있는 req.body
    const newMember = req.body;
    const member = Member.build(newMember);
    await member.save();
    // members.push(newMember);
    res.send(member);
})

// app.put('/api/members/:id', async (req, res) => {
//     const { id } = req.params;
//     const newInfo = req.body; // 바뀔 정보
//     const result = await Member.update(newInfo, { where: {id: id}});
//     // const member = members.find((m) => m.id === Number(id));
//     // forEach -> 순회하면서
//     if (result[0]) {
//          res.send({ message: `${result[0]} row(s) affected`})
//     // if (member) {
//     //     Object.keys(newInfo).forEach((prop) => {
//     //         member[prop] = newInfo[prop];
//     //     });
//     //     res.send(member);
//     } else {
//         res.status(404).send({ message: 'There is no member with the id!' })
//     }
// })


app.put('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    const newInfo = req.body;
    const member = await Member.findOne({ where : { id : id}});
    if (member) {
        Object.keys(newInfo).forEach((prop) => {
            member[prop] = newInfo[prop];
        });
        await member.save();
        res.send(member);
    } else {
        res.status(404).send({ message : 'There is no member with the id!'})
    }
})


app.delete('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    const deletedCount = await Member.destroy({ where : { id : id}});
    // const memberCount = members.length;
    if (deletedCount) {
        res.send({ message: `${deletedCount} row(s) deleted`})
    // members = members.filter((member) => member.id !== Number(id));
    // if (members.length < memberCount) {
    //     res.send({ message: 'Deleted' });
    } else {
        res.status(404).send({ message: 'There is no member with the id!' });
    }
});


app.listen(3000, () => {
    console.log('Sever is listening...')
}); // 포트 번호 3000