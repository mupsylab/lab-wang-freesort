import oss2, requests, json, os

cookie = ""
rep = requests.get("https://www.naodao.com/api/user/aLiYunClient/authorization", headers = {
    "Authorization": cookie,
    "Accept": "application/json"
})

data = json.loads(rep.text)

endpoint = 'https://%s.aliyuncs.com' % data["data"]["region"]
sts_access_key_id = data["data"]["accessKeyId"]
sts_access_key_secret = data["data"]["accessKeySecret"]
bucket_name = data["data"]["bucketName"]
security_token = data["data"]["securityToken"]
print(endpoint)
auth = oss2.StsAuth(
    sts_access_key_id,
    sts_access_key_secret,
    security_token
)

bucket = oss2.Bucket(
    auth,
    endpoint,
    bucket_name
)
# https://insula.oss-cn-chengdu.aliyuncs.com/lab-cas-07

for file in os.listdir("./"):
    if not os.path.isdir(file):
        f = open(file, "rb")
        result = bucket.put_object(
            'lab-cas-10/assets/media/imgs/渐变/%s' % file,
            f
        )
        print("%s成功上传\n" % file)

print(result)