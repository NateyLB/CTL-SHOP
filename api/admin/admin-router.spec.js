const supertest = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');


describe('server', ()=>{
    it("can run the tests", () => {
        expect(true).toBeTruthy();
    });

    describe('GET /', ()=>{
        test('should return a message', async()=>{
            const res = await supertest(server).get('/');

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({api:'up'});
        })
    });

    describe('POST /REGISTER and then POST /LOGIN', ()=>{

        it("should return with http status code of 500", (done)=>{
            supertest(server)
            .post("/api/register")
            .send({
                firstName: "Nathan",
                lastName: "Howland",
                email: "nathan@lambda.com",
                password: "Password@"
            })
            .set('Accept', 'application/json')
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                done();
              })
        })

        it("should return with http status code of 201", (done)=>{
            supertest(server)
            .post("/api/register")
            .send({
                firstName: "Katie",
                lastName: "Perry",
                email: "katie@lambda.com",
                password: "Password@"
            })
            .set('Accept', 'application/json')
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                done();
              })
        })

        it("should return with http status code 200", (done) => {
            supertest(server)
            .post("/api/login")
            .send({
                email: "katie@lambda.com",
                password: "Password@"
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
              });
        })
        it("should return with http status code 400", (done) => {
            supertest(server)
            .post("/api/login")
            .send({
                email: "katie@lambda.com"
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
              });
        })
    })
    it("should return with http status code 401", (done) => {
        supertest(server)
        .post("/api/login")
        .send({
            email: "katie@lambda.com",
            password: "Password"
        })
        .set('Accept', 'application/json')
        .expect(401)
        .end(function(err, res) {
            if (err) return done(err);
            done();
          });
    })
    
})
