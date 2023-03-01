setwd("")
rm(list = ls())
file <- list.files("origin")
file <- file[grep("cas", file, fixed = TRUE)] # 筛选以S01开头的数据文件
for (f in file) {
    print(f)
    # tmp2Data <- read.csv(f, header=TRUE, sep=",", stringsAsFactors = F, encoding = "UTF-8") # 读取单个csv，并赋予tmp2Data
    tmp2Data <- read.csv(paste("./origin/", f, sep=""), header=TRUE, sep=",", stringsAsFactors = F, encoding = "UTF-8") # 读取单个csv，并赋予tmp2Data
    if (exists("df.M")) {
        df.M <- rbind(df.M, tmp2Data)
    } else {
        df.M <- tmp2Data
    }
}
# df.M <- subset(df.M, select = -c(Name, Sex, BirthYear, Education)) # 删除被试信息部分
#rm(list = ls()[-grep("df", ls())])
# 保存文件
write.csv(df.M, file = "cas07_original.csv", row.names = F)
