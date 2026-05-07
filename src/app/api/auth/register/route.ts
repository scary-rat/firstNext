import connectDB from "@/lib/db";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// basic signup logic
//     |
//  check if email exists
//     |
//  password check for atleast 6 character
//     |
// hash password and store using brypt js
//     |

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();
        await connectDB();
        let userExist = await User.findOne({ email });

        if (userExist) {
            return NextResponse.json(
                {
                    message: "User already exist",
                },
                {
                    status: 400,
                },
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    message: "Password must be atleast 6 character",
                },
                {
                    status: 400,
                },
            );
        }

        // we hash the password using bcrypt it takes two parameter, password and salt : how many times to encrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // here storing in userObj so i can spread and add message
        // becausee in mongodb ...user is entire document itself not just my object but entire document object
        // so document  is sent as response. to avoide that we are doing this
        const userObj = user.toObject();
        delete userObj.password;

        return NextResponse.json(
            {
                user: { ...userObj, message: "User created successfully" },
            },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: `register error ${error}`,
            },
            { status: 500 },
        );
    }
}
