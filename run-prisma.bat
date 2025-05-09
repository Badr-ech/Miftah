@echo off
echo Running Prisma commands...
call npx prisma generate
call npx prisma db seed
echo Done!
pause
